import supabase from '@/lib/supabase';

export default async function handler(req, res) {
    if (req.method === 'GET') {
      const { page = 1, limit = 10 } = req.query;
      const from = (page - 1) * limit;
      const to = page * limit - 1;
  
      const { data, error, count } = await supabase
        .from('submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })  
        .range(from, to);
  
      if (error) {
        return res.status(500).json({ error: error.message });
      }
  
      return res.status(200).json({ data, count });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  }