import supabase from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { page = 1, pageSize = 10 } = req.query;

    try {
      const { data: borrows, error, count } = await supabase
        .from("new_borrow")
        .select("*", { count: "exact" })
        .order("start_time", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) {
        res.status(500).json({ message: "Error fetching borrows", error });
        return;
      }

      res.status(200).json({ borrows, total: count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
