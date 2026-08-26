# QR Resto POS — Sistem Pemesanan & Pembayaran Restoran via QR Code

Stack: **Next.js 14 + Supabase (Postgres/Realtime/Storage) + Vercel + Midtrans**
Semua di free tier, tanpa biaya bulanan (kecuali potongan % per transaksi sukses dari payment gateway — itu wajar dan bukan biaya langganan).

## 1. Setup Supabase (Database + Realtime)

1. Buat akun & project baru di https://supabase.com (gratis selamanya untuk 1 project aktif, dengan batas 500MB DB & bandwidth — cukup untuk UMKM).
2. Buka **SQL Editor** → jalankan seluruh isi file `supabase/schema.sql`. Ini akan membuat semua tabel, index, trigger, RLS policy, realtime publication, dan seed data contoh.
3. Buka **Project Settings → API**, salin:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**RAHASIA**, jangan pernah expose ke client!)
4. (Opsional) Aktifkan **Storage** → buat bucket `menu-photos` (public) untuk upload foto menu. Tempel URL publiknya di form menu owner dashboard.

## 2. Setup Payment Gateway (Midtrans — QRIS)

1. Daftar gratis di https://dashboard.midtrans.com (Sandbox dulu untuk testing, tanpa biaya).
2. Ambil **Server Key** & **Client Key** dari menu Settings → Access Keys.
3. Set **Payment Notification URL** di Midtrans dashboard ke:
   `https://domain-anda.vercel.app/api/payment/webhook`
4. Isi di `.env.local` (development) dan di Environment Variables Vercel (production).
5. Saat siap live, ajukan akun **Production** di Midtrans (perlu dokumen usaha), lalu ganti `MIDTRANS_IS_PRODUCTION=true` dan pakai Server/Client Key mode Production.

> Alternatif: Xendit juga bisa dipakai dengan pola yang sama (ganti endpoint & payload di `app/api/payment/create-qris/route.ts` dan `webhook/route.ts` sesuai dokumentasi Xendit).

## 3. Environment Variables

Salin `.env.local.example` menjadi `.env.local`, lalu isi semua nilainya.

## 4. Install & Jalankan Lokal

```bash
npm install
npm run dev
```

Buka:
- `http://localhost:3000/menu?table=01` — halaman pelanggan
- `http://localhost:3000/kds` — layar dapur
- `http://localhost:3000/kasir` — kasir
- `http://localhost:3000/owner` — dashboard owner

## 5. Deploy ke Vercel (Gratis Selamanya - Hobby Plan)

1. Push project ini ke GitHub.
2. Buka https://vercel.com → **New Project** → import repo GitHub Anda.
3. Isi semua Environment Variables yang sama seperti `.env.local`.
4. Deploy. Vercel Hobby Plan gratis untuk penggunaan personal/UMKM (unlimited deploy, bandwidth wajar untuk skala kafe/resto kecil-menengah).
5. Generate QR Code meja dari halaman **Owner Dashboard → Meja & QR Code** — otomatis memakai domain Vercel Anda.

## 6. Mode Offline LAN Backup (Intranet)

Karena Supabase adalah layanan cloud, ketika internet publik kafe mati, akses ke Supabase ikut terputus. Rekomendasi implementasi mode LAN backup:

**Opsi A — PC Kasir sebagai Local Server (direkomendasikan, tetap 100% gratis):**
1. Install **PostgreSQL** lokal + jalankan Next.js versi build (`npm run build && npm run start`) di PC kasir, disambungkan ke DB lokal yang skema-nya identik dengan `schema.sql`.
2. Di jam operasional, jalankan **sinkronisasi dua arah** sederhana (script Node.js terjadwal) yang membandingkan `updated_at` untuk sync ke Supabase saat internet kembali normal.
3. KDS & Kasir diakses staf lain di kafe lewat IP lokal PC kasir (`http://192.168.x.x:3000/kds`), terhubung ke Wi-Fi kafe yang sama — tidak butuh internet.

**Opsi B — Sederhana (untuk skala kecil):**
- Gunakan **PWA dengan Service Worker** (caching) di halaman KDS/Kasir sehingga tetap bisa lihat order yang sudah ter-load terakhir kali, dan antre perubahan status untuk dikirim ulang begitu koneksi pulih (queue di IndexedDB browser).

Karena ini butuh infrastruktur tambahan (PostgreSQL lokal + script sync) yang sangat spesifik dengan jaringan kafe Anda, bagian ini sengaja didesain sebagai panduan arsitektur — beri tahu saya kalau Anda mau saya bantu kodekan script sync-nya secara detail.

## 7. Cetak Struk / Thermal Printer

Kode di `app/kds/page.tsx` dan `app/kasir/page.tsx` memakai `window.print()` sederhana (browser print dialog) yang bisa diarahkan ke printer thermal yang sudah di-*share* sebagai default printer di Windows/PC kasir & dapur (via USB/LAN/Bluetooth yang sudah dipasang drivernya di OS).

Untuk cetak langsung tanpa dialog print (auto-print ke printer Bluetooth/LAN), disarankan integrasi dengan:
- **QZ Tray** (gratis, open-source) — untuk cetak langsung dari browser ke printer LAN/USB.
- **RawBT** (Android) — untuk printer Bluetooth di tablet kasir/dapur Android.

## 8. Struktur Folder

```
qr-resto/
├── app/
│   ├── menu/page.tsx           # Customer - server wrapper (baca ?table=)
│   ├── kds/page.tsx             # Kitchen Display System
│   ├── kasir/page.tsx           # Kasir
│   ├── owner/page.tsx           # Owner Dashboard (tab: menu/meja/laporan)
│   ├── api/payment/
│   │   ├── create-qris/route.ts # Buat transaksi Midtrans Snap
│   │   └── webhook/route.ts     # Terima notifikasi status bayar
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── MenuClient.tsx           # Katalog menu + cart (client)
│   ├── VarianModal.tsx          # Modal pilih varian/add-on
│   ├── CartView.tsx             # Keranjang
│   ├── TrackingView.tsx         # Tracking status + Split Bill
│   └── owner/
│       ├── MenuManager.tsx      # CRUD menu & kategori
│       ├── MejaQrManager.tsx    # CRUD meja + generate/cetak QR
│       └── LaporanPenjualan.tsx # Chart omzet, menu terlaris, jam sibuk
├── lib/
│   ├── supabase.ts              # Client Supabase (anon key)
│   ├── types.ts                 # TypeScript types
│   └── format.ts                # Helper format Rupiah
└── supabase/schema.sql          # DDL lengkap + RLS + realtime + seed data
```

## 9. Catatan Keamanan Penting

- Policy RLS di `schema.sql` sengaja dibuat terbuka (public read/write) supaya cepat jalan tanpa setup Auth staff dulu. **Sebelum go-live**, disarankan:
  1. Aktifkan Supabase Auth untuk staf (kasir/dapur/owner) dengan role masing-masing.
  2. Ganti policy `menu`, `orders`, dsb agar operasi sensitif (hapus menu, ubah harga, konfirmasi bayar tunai) hanya bisa dilakukan user yang sudah login sebagai staf.
  3. `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai di server (API Route), **tidak pernah** di kode client/browser.
- Signature verification webhook Midtrans sudah diimplementasikan di `webhook/route.ts` — jangan dihapus, ini mencegah orang memalsukan notifikasi "pembayaran lunas".
