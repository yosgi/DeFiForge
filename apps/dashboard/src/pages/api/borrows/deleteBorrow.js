import supabase from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      res.status(400).json({ message: "Missing borrow ID" });
      return;
    }

    try {
      const { error } = await supabase.from("new_borrow").delete().eq("id", id);

      if (error) {
        res.status(500).json({ message: "Error deleting borrow entry", error });
        return;
      }

      res.status(200).json({ message: "Borrow entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
