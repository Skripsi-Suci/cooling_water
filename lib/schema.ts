import { z } from "zod"

export const classificationSchema = z.object({
  unit_name: z.string().min(1, "Unit harus dipilih"),
  engine_id: z.string().min(1, "Engine ID harus diisi"),
  running_hour: z.coerce.number().min(0, "Running hour tidak boleh negatif"),
  ph: z.coerce.number().min(0).max(14, "pH harus di antara 0 - 14"),
  sc: z.coerce.number().min(0, "SC harus diisi"),
  nitrite: z.coerce.number().min(0, "Nitrite harus diisi"),
  iron: z.coerce.number().min(0, "Fe harus diisi"),
  sulfate: z.coerce.number().min(0, "Sulfate harus diisi"),
  turbidity: z.coerce.number().min(0, "Turbidity harus diisi"),
  date: z.string().optional(),
})

export type ClassificationInput = z.infer<typeof classificationSchema>
