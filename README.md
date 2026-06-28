# EL-Tellawi Store (متجر التلاوي)

Welcome to the **EL-Tellawi Store** web application. This project is a modern, responsive, single-page product catalog and administration system built for clients to easily display products online and receive orders directly via WhatsApp. It utilizes **React**, **Vite**, and **Supabase** for a lightning-fast, backend-as-a-service solution.

---

## 🚀 Key Features

* **Public Product Catalog:** A beautiful, responsive grid showcasing all available items with RTL (Right-to-Left) Arabic language support.
* **One-Click WhatsApp Ordering:** Customers can click an item to immediately open a pre-formatted WhatsApp chat ordering or inquiring about that specific product.
* **Smart Image Optimization:** Automatically compresses uploaded product photos client-side and converts them to high-efficiency `.webp` format to ensure rapid page load speeds.
* **Hidden Admin Dashboard:** A secure login system accessible only via a dedicated query link (`?admin=true`) to safeguard the admin environment from unauthorized visitors.
* **Full CRUD Control:** Authorized admins can seamlessly add new products (with auto-handled cloud media storage) or delete existing ones.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** React (Hooks: `useState`, `useEffect`)
* **Build Tool:** Vite
* **Backend Database & Auth:** Supabase (PostgreSQL Database)
* **Cloud Object Storage:** Supabase Storage (Bucket: `product-images`)
* **Styling:** Modern CSS3 with Flexbox, CSS Grid layouts, and custom keyframes

---

## 📋 Prerequisites & Supabase Setup

Before running or deploying the application, make sure your **Supabase** instance has the following configurations:

1. **Database Table:** Create a table named `products`.
   * `id`: int8 or uuid (Primary Key, auto-generating)
   * `name`: text (Product Title)
   * `image_url`: text (Public URL of the uploaded image)
2. **Storage Bucket:** Create a **public** storage bucket named `product-images`.
3. **Authentication:** Enable the **Email/Password** provider in your Supabase Auth settings and register your admin account.

---

## ⚙️ Environment Variables

Create a `.env` file in the root of your project directory and configure the following parameters:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anonymous_api_key
VITE_WHATSAPP_NUMBER=201093761889