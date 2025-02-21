import supabase from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ error: 'Missing required field: teamId' });
    }

    try {
      // 获取团队信息
      const { data: teamData, error: teamError } = await supabase
        .from('loop_teams')
        .select('id, leaderId, total_team_investment')
        .eq('id', teamId)
        .single();

      if (teamError || !teamData) {
        return res.status(404).json({ message: 'Team not found', error: teamError });
      }

      // 获取队长信息
      const { data: leaderData, error: leaderError } = await supabase
        .from('users')
        .select('id, account, total_investment')
        .eq('id', teamData.leaderId)
        .single();

      if (leaderError || !leaderData) {
        return res.status(404).json({ message: 'Leader not found', error: leaderError });
      }

      // 获取团队成员信息
      const { data: membersData, error: membersError } = await supabase
        .from('users')
        .select('id, account, total_investment')
        .eq('teamId', teamId);

      if (membersError) {
        throw membersError;
      }

      // 返回团队详细信息
      res.status(200).json({
        leader: leaderData,
        members: membersData,
        total_investment: teamData.total_team_investment,
      });
    } catch (error) {
      console.error('Error fetching team details:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
