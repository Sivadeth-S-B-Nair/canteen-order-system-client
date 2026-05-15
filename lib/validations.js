import { z } from "zod";

const nameField = z
  .string()
  .min(2, "Name must be atleast 2 character")
  .max(50, "Name must be under 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens and apostrophes",
  );

const emailField = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

const passwordField = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password is too long");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});
export const loginDefault = { email: "", password: "" };

export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password:passwordField,
  role: z.enum(["user"], { errorMap: () => ({ message: "Invalid role" }) }),
});
export const registerDefault = {
  name: "",
  email: "",
  password: "",
  role: "user",
};

export const menuItemSchema = z.object({
  name: z
    .string()
    .min(2, "Item name must be atleat 2 characters")
    .max(80, "Item name must be under 80 characters"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Price must be positive number" },
    ),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(40, "Category must be under 40 characters"),

  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),
});
export const menuItemDefault = { name: "", price: "", category: "", description: "" }

export const staffSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
})
 
export const staffDefault = { name: "", email: "", password: "" }

export const restaurantSchema = z.object({
  name: z
    .string()
    .min(2, "Restaurant name must be at least 2 characters")
    .max(100, "Restaurant name must be under 100 characters"),
 
  location: z
    .string()
    .max(200, "Location must be under 200 characters")
    .optional()
    .or(z.literal("")),
})
export const restaurantDefault = { name: "", location: "" }

export const restaurantAdminSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  restaurantId: z
    .string()
    .min(1, "Please select a restaurant"),
})
 
export const restaurantAdminDefault = { name: "", email: "", password: "", restaurantId: "" }

export const addressSchema = z.object({
  label:       z.string().min(1, "Label is required").max(50),
  addressLine: z.string().min(3, "Address is required").max(255),
  city:        z.string().max(100).optional().or(z.literal("")),
  state:       z.string().max(100).optional().or(z.literal("")),
  pincode:     z.string().max(20).optional().or(z.literal("")),
  phone:       z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  isDefault:   z.boolean().optional(),
});
 
export const addressDefault = {
  label: "Home",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  isDefault: false,
};

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50)
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens and apostrophes"),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});