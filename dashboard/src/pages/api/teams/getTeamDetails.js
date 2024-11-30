import supabase from '@/lib/supabase';
export default async function handler(req, res) {
    if (req.method === 'GET') {
      const { teamId,leaderId } = req.query;
      try {
        // Fetch team leader
        const { data: leaderData, error: leaderError } = await supabase
          .from('users')
          .select('id, account, total_investment')
          .eq('id', leaderId)
          .single();
        if (leaderError) throw leaderError;
  
        // Fetch team members
        const { data: membersData, error: membersError } = await supabase
          .from('users')
          .select('id, account, total_investment')
          .eq('teamId', teamId);
        if (membersError) throw membersError;
  
        res.status(200).json({ leader: leaderData, members: membersData });
      } catch (error) {
        console.error('Error fetching team details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  }
  