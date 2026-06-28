EL-Tellawi Store (متجر التلاوي)
Welcome to the EL-Tellawi Store web application. This project is a modern, responsive, single-page product catalog and administration system built for clients to easily display products online and receive orders directly via WhatsApp. It utilizes React, Vite, and Supabase for a powerful backend-as-a-service solution.

🚀 Key Features
Public Product Catalog: A beautiful, responsive grid showcasing all available items with RTL (Right-to-Left) Arabic language support.

One-Click WhatsApp Ordering: Customers can click an item to immediately open a pre-formatted WhatsApp chat ordering or inquiring about that specific product.

Smart Image Optimization: Automatically client-side compresses uploaded product photos and converts them into the high-efficiency .webp format to ensure rapid page load speeds.

Hidden Admin Dashboard: A secure login system accessible only via a dedicated query link (?admin=true) to safeguard the admin environment from unauthorized visitors.

Full CRUD Control: Authorized admins can seamlessly add new products (with auto-handled cloud media storage) or delete existing ones.

🛠️ Tech Stack & Architecture
Frontend: React (Hooks: useState, useEffect)

Build Tool: Vite

Backend Database & Auth: Supabase (PostgreSQL Database)

Cloud Object Storage: Supabase Storage (Bucket: product-images)

Styling: Modern CSS3 with Flexbox, CSS Grid layouts, and custom keyframes

📋 Prerequisites & Supabase Setup
Before running or deploying the application, make sure your Supabase instance has the following configurations:

Database Table: Create a table named products.

id: int8 or uuid (Primary Key, auto-generating)

name: text (Product Title)

image_url: text (Public URL of the uploaded image)

created_at: timestamp (optional)

Storage Bucket: Create a public bucket named product-images.

Authentication: Enable Email/Password provider in your Supabase Auth settings and generate an administrator account.

⚙️ Environment Variables
Create a .env file in the root of your project directory and configure the following parameters:

Code snippet
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anonymous_api_key
VITE_WHATSAPP_NUMBER=201093761889
⚠️ Note: Ensure your VITE_WHATSAPP_NUMBER includes the international country code without any preceding + or 00 (e.g., 201... for Egypt).

📦 Local Installation & Development
To spin up a local instance of the storefront:

Clone or download the source code repository.

Install project dependencies:

Bash
npm install
Boot up the local development server:

Bash
npm run dev
🔐 Administrative Access Guide
To prevent casual shoppers from viewing the management interface, the login gateway uses a query hidden entry point:

Standard Storefront URL: http://localhost:5173/

Admin Access URL: http://localhost:5173/?admin=true

Visiting the admin URL forces the application context to render the authentication portal, allowing you to log in with your preset Supabase credentials. Upon logging out, the query parameter is automatically scrubbed from the window history tab for safety.