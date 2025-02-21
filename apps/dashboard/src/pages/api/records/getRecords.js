import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { 
        page = 1, 
        pageSize = 10, 
        user_address, 
        salesperson, 
        status, 
        start_time, 
        end_time, 
        period 
      } = req.query;

      let query = supabase
        .from('records')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (user_address) {
        query = query.ilike('user_address', `%${user_address}%`);
      }

      if (salesperson) {
        query = query.ilike('salesperson', `%${salesperson}%`);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (start_time) {
        query = query.gte('start_time', new Date(start_time).toISOString());
      }

      if (end_time) {
        query = query.lte('end_time', new Date(end_time).toISOString());
      }

      if (period) {
        query = query.eq('period', period);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      res.status(200).json({ records: data, total: count, page, pageSize });
    } catch (error) {
      console.error('Error fetching records:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
