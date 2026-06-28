import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORE_NAME = "متجر التلاوي";
const STORE_NAME_EN = "EL-Tellawi Store";

const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                `${file.name.split(".")[0]}.webp`,
                {
                  type: "image/webp",
                },
              );
              resolve(compressedFile);
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          },
          "image/webp",
          quality,
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

function App() {
  // Navigation State: 'catalog' | 'login' | 'admin'
  const [view, setView] = useState("catalog");
  const [products, setProducts] = useState([]);
  const [session, setSession] = useState(null);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // جلب رقم الواتساب مباشرة من ملف الـ .env
  const WHATSAPP_NUMBER =
    import.meta.env.VITE_WHATSAPP_NUMBER || "201093761889";

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) console.error("Error fetching products:", error);
    else setProducts(data || []);
  };

  // مراقبة الرابط السري وحالة تسجيل الدخول
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const isAdminLink = queryParams.get("admin") === "true";

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (isAdminLink) {
        setView(session ? "admin" : "login");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (isAdminLink) {
        setView(session ? "admin" : "login");
      }
    });

    fetchProducts();

    return () => subscription.unsubscribe();
  }, []);

  // تسجيل دخول الأدمن
  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(`فشل تسجيل الدخول: ${error.message}`);
    } else {
      setView("admin");
      setEmail("");
      setPassword("");
    }
  };

  // تسجيل خروج الأدمن تنظيف الرابط السري
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.history.replaceState({}, document.title, window.location.pathname);
    setView("catalog");
  };

  // إضافة منتج جديد (اسم وصورة فقط مع رفع الملف لـ Storage)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !image) return alert("برجاء كتابة اسم المنتج واختيار صورة!");

    setUploading(true);
    try {
      const compressedImageFile = await compressImage(image, 800, 0.7);
      const fileName = `${Date.now()}.webp`;

      // رفع الصورة لـ Storage باكت product-images كما بالمنطق الخاص بك
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, compressedImageFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // إدخال الاسم ورابط الصورة بقاعدة البيانات
      const { error: insertError } = await supabase
        .from("products")
        .insert([{ name, image_url: imageUrl }]);

      if (insertError) throw insertError;

      setName("");
      setImage(null);
      document.getElementById("imageInput").value = "";
      fetchProducts();
      alert("تم إضافة المنتج بنجاح! 🎉");
    } catch (err) {
      alert(`فشل الرفع: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // مسح منتج
  const handleDeleteProduct = async (id) => {
    if (window.confirm("هل أنت متأكد من مسح هذا المنتج نهائياً؟")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) console.error("Error deleting product:", error);
      else fetchProducts();
    }
  };

  return (
    <div className="app-container" dir="rtl">
      {/* NAVBAR */}
      <header className="nav">
        <div className="nav-inner">
          <div
            className="brand"
            onClick={() => setView("catalog")}
            style={{ cursor: "pointer" }}
          >
            <span className="brand-mark">ط</span>
            <span className="brand-text">
              <strong>{STORE_NAME}</strong>
              <small>{STORE_NAME_EN}</small>
            </span>
          </div>
          <div className="nav-actions">
            {view !== "catalog" && (
              <button className="nav-link" onClick={() => setView("catalog")}>
                المنتجات
              </button>
            )}
            {session && (view === "admin" || view === "login") && (
              <>
                <button
                  className="nav-link active"
                  onClick={() => setView("admin")}
                >
                  لوحة التحكم
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  خروج
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* CONTAINER CONTROL */}
      <main className="container">
        {/* 1. PUBLIC CUSTOMER VIEW */}
        {view === "catalog" && (
          <section className="customer-view">
            <div className="hero">
              <div className="hero-content">
                <h1>
                  أهلاً بك في <span className="accent">{STORE_NAME}</span>
                </h1>
                <p className="hero-desc">
                  كل ما تحتاجه في مكان واحد، تصفح واطلب مباشرة عبر الواتساب
                  ببساطة.
                </p>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="emoji">🛍️</div>
              </div>
            </div>

            <div className="section-head">
              <h2>كل المنتجات المتاحة</h2>
              <span className="count">{products.length} منتج</span>
            </div>

            {products.length === 0 ? (
              <div className="empty">
                <div className="empty-emoji">📭</div>
                <p>مفيش منتجات معروضة حالياً.</p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => {
                  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `السلام عليكم \nحابب أطلب أو أستفسر عن المنتج ده: ${product.name}`,
                  )}`;

                  return (
                    <a
                      key={product.id}
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="card product"
                    >
                      <div className="product-img">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="img-fallback">🛒</div>
                        )}
                      </div>
                      <div className="product-body">
                        <h3>{product.name}</h3>
                        <div className="btn btn-wa">
                          {/* أيقونة واتساب SVG احترافية */}
                          <svg
                            className="wa-icon"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="20"
                            height="20"
                          >
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.528 2.003 14.056.977 11.438.977c-5.44 0-9.865 4.369-9.87 9.802-.001 1.73.461 3.42 1.338 4.916l-.993 3.629 3.734-.97zm11.205-5.16c-.302-.15-1.787-.88-2.063-.98-.277-.1-.478-.15-.68.15-.202.3-.78.98-.956 1.18-.177.2-.353.226-.655.076-1.393-.696-2.42-1.215-3.394-2.87-.257-.439.257-.407.734-1.353.08-.162.04-.302-.02-.453-.06-.15-.478-1.15-.655-1.58-.173-.415-.348-.359-.478-.365-.124-.006-.266-.007-.408-.007-.143 0-.377.054-.573.268-.197.213-.75.733-.75 1.79 0 1.056.77 2.074.877 2.217.107.143 1.516 2.315 3.673 3.245.513.221.913.354 1.226.453.516.163.985.14 1.355.084.414-.062 1.787-.732 2.039-1.44.252-.708.252-1.313.177-1.44-.075-.126-.277-.201-.579-.351z" />
                          </svg>
                          <span>اطلب الآن</span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 2. ADMIN LOGIN VIEW */}
        {view === "login" && (
          <section className="auth-container">
            <div className="card auth-card">
              <div className="auth-icon">🔐</div>
              <h2>تسجيل دخول الأدمن</h2>
              <p className="muted">الرجاء إدخال بيانات حسابك لإدارة المتجر.</p>
              <form onSubmit={handleLogin}>
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label>كلمة المرور</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button className="btn btn-primary btn-block" type="submit">
                  دخول
                </button>
              </form>
            </div>
          </section>
        )}

        {/* 3. PROTECTED ADMIN DASHBOARD */}
        {view === "admin" &&
          (session ? (
            <section className="admin-dashboard">
              <h2 className="admin-title">لوحة التحكم والإدارة</h2>

              <div className="card panel">
                <h3>➕ إضافة منتج جديد</h3>
                <form onSubmit={handleAddProduct} className="form-grid">
                  <div className="col-span-2">
                    <label>اسم المنتج</label>
                    <input
                      type="text"
                      placeholder="اكتب اسم المنتج هنا"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label>صورة المنتج (اختر ملف من جهازك)</label>
                    <input
                      type="file"
                      id="imageInput"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={uploading}
                    >
                      {uploading
                        ? "جاري رفع البيانات وحفظ المنتج..."
                        : "إضافة المنتج للمتجر"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="card panel">
                <h3>
                  📦 المنتجات الحالية المتاحة في الكتالوج ({products.length})
                </h3>
                {products.length === 0 ? (
                  <p className="muted">لا توجد عناصر مضافة بعد.</p>
                ) : (
                  <div className="admin-list">
                    {products.map((product) => (
                      <div key={product.id} className="admin-item">
                        <img src={product.image_url} alt={product.name} />
                        <span className="admin-item-name">{product.name}</span>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="btn btn-danger btn-sm"
                        >
                          مسح المنتج
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <div
              className="card panel access-denied"
              style={{ textAlign: "center", padding: "40px 20px" }}
            >
              <div style={{ fontSize: "40px" }}>⚠️</div>
              <h3>غير مسموح بالدخول</h3>
              <p className="muted">
                برجاء تسجيل الدخول أولاً لرؤية أدوات التحكم والمراقبة.
              </p>
            </div>
          ))}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} {STORE_NAME} — جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}

export default App;
