// backend/src/routes/therapists.ts
import { Router } from 'express';
import Therapist from '../models/therapists';

const router = Router();

function asArray(q: any) {
  if (!q) return [];
  return Array.isArray(q) ? q : String(q).split(',').map((s:string) => s.trim()).filter(Boolean);
}

router.get('/', async (req, res) => {
  console.log('GET /therapists - Request received:', {
    query: req.query,
    timestamp: new Date().toISOString()
  });
  
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 12);
  const search = String(req.query.search || '').trim();
  const cities = asArray(req.query.cities);
  const genders = asArray(req.query.genders);
  const modes = asArray(req.query.modes);

  const match: any = {};
  if (cities.length) match.city = { $in: cities };
  if (genders.length) match.gender = { $in: genders };
  
  // Handle consolidated mode filtering
  if (modes.length) {
    const modeConditions: any[] = [];
    
    modes.forEach(mode => {
      if (mode === 'In-person') {
        // Match any in-person related modes
        modeConditions.push({
          modes: { 
            $in: [
              'In-person', 'I', '-perso', 'In person', 'in-person', 'in person'
            ]
          }
        });
      } else if (mode === 'Online') {
        // Match any online related modes
        modeConditions.push({
          modes: { 
            $in: [
              'Virtual telephonic', 'Virtual video-based', 'Virtual telepho', 'ic',
              'Online', 'online', 'Virtual', 'virtual'
            ]
          }
        });
      } else {
        // Fallback to exact match for other modes
        modeConditions.push({ modes: { $in: [mode] } });
      }
    });
    
    if (modeConditions.length > 0) {
      match.$or = modeConditions;
    }
  }

  const pipeline: any[] = [];
  
  // Handle search with different strategies based on search length
  if (search) {
    if (search.length < 3) {
      // For short searches (1-2 characters), use regex search
      const regex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { name: regex },
            { expertise: { $in: [regex] } },
            { education: { $in: [regex] } },
            { about: regex }
          ]
        }
      });
    } else {
      // For longer searches, use MongoDB text search
      pipeline.push({ $match: { $text: { $search: search } } });
    }
  }
  
  if (Object.keys(match).length) pipeline.push({ $match: match });

  pipeline.push({
    $facet: {
      metadata: [{ $count: 'total' }],
      data: [{ $sort: { name: 1 } }, { $skip: (page - 1) * limit }, { $limit: limit }]
    }
  });

  const results = await Therapist.aggregate(pipeline);
  const total = (results[0]?.metadata?.[0]?.total) || 0;
  const data = results[0]?.data || [];
  res.json({ page, limit, total, data });
});

router.get('/:id', async (req, res) => {
  const t = await Therapist.findById(req.params.id).lean();
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

// helper for filter counts
router.get('/_filters/options', async (_req, res) => {
  console.log(' GET /_filters/options - Request received:', {
    timestamp: new Date().toISOString()
  });
  
  const cityCounts = await Therapist.aggregate([{ $group: { _id: '$city', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
  const genderCounts = await Therapist.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]);
  
  // Get raw mode counts
  const rawModeCounts = await Therapist.aggregate([
    { $unwind: { path: '$modes', preserveNullAndEmptyArrays: false } }, 
    { $group: { _id: '$modes', count: { $sum: 1 } } }
  ]);
  
  // Consolidate mode counts into In-person and Online
  const consolidatedModeCounts = [
    {
      _id: 'In-person',
      count: rawModeCounts
        .filter(mode => 
          mode._id?.toLowerCase().includes('person') || 
          mode._id?.toLowerCase().includes('perso') ||
          mode._id === 'I' ||
          mode._id === '-perso'
        )
        .reduce((sum, mode) => sum + mode.count, 0)
    },
    {
      _id: 'Online',
      count: rawModeCounts
        .filter(mode => 
          mode._id?.toLowerCase().includes('virtual') || 
          mode._id?.toLowerCase().includes('telepho') ||
          mode._id?.toLowerCase().includes('video') ||
          mode._id?.toLowerCase().includes('ic')
        )
        .reduce((sum, mode) => sum + mode.count, 0)
    }
  ];
  
  console.log('✅ Filter options sent:', { 
    cityCounts: cityCounts.length, 
    genderCounts: genderCounts.length, 
    modeCounts: consolidatedModeCounts.length 
  });
  res.json({ cityCounts, genderCounts, modeCounts: consolidatedModeCounts });
});

export default router;
