import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { page = 1, pageSize = 10, symbol } = req.query;

      let query = supabase
        .from('kline_data')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (symbol) {
        query = query.ilike('symbol', `%${symbol}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      res.status(200).json({ records: data, total: count, page, pageSize });
    } catch (error) {
      console.error('Error fetching K-Line data:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
