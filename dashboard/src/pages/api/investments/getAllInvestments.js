import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const {
        page = 1,
        pageSize = 10,
        userId,
        amountMin,
        amountMax,
        status,
      } = req.query;

      let query = supabase
        .from('investments')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      if (userId) {
        query = query.eq('userId', userId);
      }

      if (amountMin) {
        query = query.gte('amount', parseFloat(amountMin));
      }

      if (amountMax) {
        query = query.lte('amount', parseFloat(amountMax));
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      res.status(200).json({ records: data, total: count, page, pageSize });
    } catch (error) {
      console.error('Error fetching investments:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
