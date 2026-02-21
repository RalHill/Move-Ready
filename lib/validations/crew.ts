import { z } from "zod";

export const addCrewSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be 10 digits (e.g., 4165551234)"),
  vehicleType: z.enum(["truck", "van", "suv"], {
    message: "Please select a vehicle type",
  }),
  licensePlate: z
    .string()
    .min(1, "License plate is required")
    .max(10, "License plate must be less than 10 characters")
    .transform((val) => val.toUpperCase()),
  initialStatus: z.enum(["available", "offline"], {
    message: "Please select initial status",
  }),
  startLat: z
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude")
    .default(43.6532),
  startLng: z
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .default(-79.3832),
});

export type AddCrewFormData = z.infer<typeof addCrewSchema>;

export const step1Schema = addCrewSchema.pick({ name: true, phone: true });
export const step2Schema = addCrewSchema.pick({
  vehicleType: true,
  licensePlate: true,
});
export const step3Schema = addCrewSchema.pick({
  initialStatus: true,
  startLat: true,
  startLng: true,
});
