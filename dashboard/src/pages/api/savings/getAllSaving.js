import supabase from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { page = 1, pageSize = 10 } = req.query;

    const rangeStart = (page - 1) * pageSize;
    const rangeEnd = rangeStart + Number(pageSize) - 1;

    const { data: savings, error, count } = await supabase
      .from("savings")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(rangeStart, rangeEnd);

    if (error) {
      res.status(500).json({ message: "Error fetching savings" });
      return;
    }

    res.status(200).json({ savings, total: count });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
