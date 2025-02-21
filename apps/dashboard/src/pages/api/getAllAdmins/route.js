import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { page = 1, pageSize = 10, username, email } = req.query;
      
      let query = supabase
        .from('admin')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (username) {
        query = query.ilike('username', `%${username}%`);
      }

      if (email) {
        query = query.ilike('email', `%${email}%`);
      }

      const { data: admins, error, count } = await query;

      if (error) throw error;

      res.status(200).json({ admins, total: count });
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
