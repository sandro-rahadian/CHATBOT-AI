-- ==============================================================================
-- FILE SQL MIGRATION / UPDATE DATA JURUSAN SMK DI MALANG (RAILWAY MYSQL)
-- Database: chatbot_sekolah
-- Tabel: school_majors
--
-- CARA PENGGUNAAN DI RAILWAY:
-- 1. Buka dashboard Railway project Anda -> Pilih MySQL service.
-- 2. Klik tab "Data" atau "Query" (atau gunakan HeidiSQL / DBeaver via URL koneksi).
-- 3. Jalankan seluruh perintah SQL di bawah ini.
-- ==============================================================================

USE `chatbot_sekolah`;

-- 1. Pastikan tabel schools memiliki data 5 SMK utama di Malang
INSERT INTO `schools` (`id`, `name`, `aliases`, `address`) VALUES
  (1, 'SMK Telkom Malang', 'smk telkom, moklet, telkom malang, smk telkom sandhy putra', 'Jl. Danau Ranau No. 01, Sawojajar, Kedungkandang, Kota Malang'),
  (2, 'SMK Negeri 3 Malang', 'smkn 3, smkn 3 malang, smk 3 malang, smk negeri 3', 'Jl. Surabaya No. 1, Gading Kasri, Klojen, Kota Malang'),
  (3, 'SMK Negeri 4 Malang', 'smkn 4, smkn 4 malang, smk 4 malang, smk grafika, grafika malang', 'Jl. Tanimbar No. 22, Kasin, Klojen, Kota Malang'),
  (4, 'SMK Negeri 5 Malang', 'smkn 5, smkn 5 malang, smk 5 malang, smk negeri 5', 'Jl. Ikan Piranha Atas No. 84, Tunjungsekar, Lowokwaru, Kota Malang'),
  (5, 'SMK Negeri 6 Malang', 'smkn 6, smkn 6 malang, smk 6 malang, stm negeri malang', 'Jl. Ki Ageng Gribig No. 28, Madyopuro, Kedungkandang, Kota Malang')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `aliases` = VALUES(`aliases`),
  `address` = VALUES(`address`);

-- 2. Standardisasi Data Jurusan (school_majors) dengan Format Terstruktur & Konsisten

-- ==========================================
-- 2.1 SMK TELKOM MALANG (school_id = 1)
-- ==========================================
INSERT INTO `school_majors` (`school_id`, `title`, `content`, `keywords`) VALUES
(1, 'Jurusan yang tersedia',
 'SMK Telkom Malang memiliki tiga jurusan utama di bidang teknologi informasi: Rekayasa Perangkat Lunak (RPL), Teknik Komputer dan Jaringan (TKJ), dan Pengembangan Gim (PG).',
 'jurusan program studi pilihan rpl tkj pg telkom malang moklet teknologi informasi'),

(1, 'Jurusan Rekayasa Perangkat Lunak (RPL)',
 'Rekayasa Perangkat Lunak (RPL) berfokus pada pembuatan aplikasi, pemrograman, web development, dan mobile development. Lulusan berkarier sebagai programmer atau full stack developer.',
 'rpl rekayasa perangkat lunak software programmer pemrograman coding aplikasi developer web mobile'),

(1, 'Jurusan Teknik Komputer dan Jaringan (TKJ)',
 'Teknik Komputer dan Jaringan (TKJ) berfokus pada pengelolaan infrastruktur jaringan, konfigurasi server, perakitan komputer, dan internet of things (IoT). Lulusan berpeluang sebagai network engineer atau system administrator.',
 'tkj teknik komputer jaringan network engineer infrastruktur server internet kabel perakitan mikrotik cisco'),

(1, 'Jurusan Pengembangan Gim (PG)',
 'Pengembangan Gim (PG) adalah jurusan yang dibuka sejak 2024 bagi peminat industri kreatif game. Siswa mempelajari perancangan konsep cerita/level, pembuatan aset 2D/3D grafis, game engine, dan pemrograman gim dengan dukungan fasilitas Game Station.',
 'pg pengembangan gim game gamedev game developer membuat game grafis 2d 3d game station unity unreal')
ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `keywords` = VALUES(`keywords`);

-- ==========================================
-- 2.2 SMK NEGERI 4 MALANG (school_id = 3)
-- ==========================================
INSERT INTO `school_majors` (`school_id`, `title`, `content`, `keywords`) VALUES
(3, 'Jurusan yang tersedia',
 'SMK Negeri 4 Malang (dikenal sebagai Sekolah Grafika) memiliki 11 kompetensi keahlian: Desain Grafika, Produksi Grafika (Teknik Grafika), Multimedia, Animasi, Desain Komunikasi Visual (DKV), Rekayasa Perangkat Lunak (RPL), Teknik Komputer dan Jaringan (TKJ), Teknik Mekatronika, Teknik Elektronika, Teknik Logistik, dan Perhotelan.',
 'jurusan program keahlian kompetensi smkn 4 smk 4 malang grafika percetakan animasi dkv rpl tkj mekatronika'),

(3, 'Jurusan Rekayasa Perangkat Lunak (RPL)',
 'Rekayasa Perangkat Lunak (RPL / PPLG) di SMK Negeri 4 Malang berfokus pada rekayasa perangkat lunak, pemrograman web, mobile application, basis data, dan pembuatan aplikasi komputer.',
 'rpl rekayasa perangkat lunak pplg software pemrograman aplikasi web mobile coding smkn 4 smk 4 malang'),

(3, 'Jurusan Teknik Komputer dan Jaringan (TKJ)',
 'Teknik Komputer dan Jaringan (TKJ / TJKT) di SMK Negeri 4 Malang berfokus pada perakitan komputer, konfigurasi jaringan LAN/WAN, routing, keamanan jaringan, dan administrasi server.',
 'tkj teknik komputer jaringan tjkt network administrator infrastruktur server smkn 4 smk 4 malang'),

(3, 'Jurusan Desain Grafika',
 'Desain Grafika di SMK Negeri 4 Malang berfokus pada proses pracetak (pre-press), desain kemasan, tata letak media cetak, tipografi, dan pembuatan produk grafika kreatif.',
 'desain grafika grafis cetak percetakan pre-press kemasan packaging smkn 4 smk 4 malang grafika'),

(3, 'Jurusan Produksi Grafika (Teknik Grafika)',
 'Produksi Grafika (Teknik Grafika) di SMK Negeri 4 Malang berfokus pada operasional mesin cetak offset, cetak digital, sablon, finishing cetak, serta teknik penjilidan percetakan modern.',
 'produksi grafika teknik grafika cetak offset digital printing finishing sablon percetakan smkn 4 malang'),

(3, 'Jurusan Desain Komunikasi Visual (DKV)',
 'Desain Komunikasi Visual (DKV) di SMK Negeri 4 Malang berfokus pada perancangan identitas visual, branding, ilustrasi digital, desain periklanan, fotografi komersial, dan videografi.',
 'dkv desain komunikasi visual branding visual grafis ilustrasi fotografi iklan smkn 4 smk 4 malang'),

(3, 'Jurusan Animasi',
 'Animasi di SMK Negeri 4 Malang (dibuka sejak 2006) berfokus pada pembuatan karya animasi 2D dan 3D, perancangan karakter, storyboard, pemodelan objek 3D, dan pascaproduksi film animasi.',
 'animasi animation 2d 3d rigging modelling render film animasi kartun smkn 4 smk 4 malang'),

(3, 'Jurusan Multimedia',
 'Multimedia di SMK Negeri 4 Malang berfokus pada pengolahan media audio visual interaktif, video editing, konten digital, media pembelajaran, dan motion graphic.',
 'multimedia konten digital audio visual video editing motion graphic smkn 4 smk 4 malang'),

(3, 'Jurusan Teknik Mekatronika',
 'Teknik Mekatronika di SMK Negeri 4 Malang berfokus pada integrasi sistem mekanik, elektronika cerdas, otomatisasi industri, PLC, dan teknologi robotika cerdas.',
 'mekatronika robotika otomatisasi plc sensor pneumatik hidrolik industri smkn 4 smk 4 malang'),

(3, 'Jurusan Teknik Elektronika',
 'Teknik Elektronika di SMK Negeri 4 Malang berfokus pada perancangan rangkaian elektronika, mikroprosesor/mikrokontroler, instrumen industri, dan perbaikan perangkat elektronik.',
 'teknik elektronika elektronika industri mikrokontroler komponen pcb sirkuit smkn 4 smk 4 malang'),

(3, 'Jurusan Teknik Logistik',
 'Teknik Logistik di SMK Negeri 4 Malang berfokus pada pengelolaan rantai pasok (supply chain management), operasional pergudangan modern, administrasi pengiriman barang, dan logistik digital.',
 'logistik teknik logistik pergudangan supply chain ekspedisi warehouse inventaris smkn 4 smk 4 malang'),

(3, 'Jurusan Perhotelan',
 'Perhotelan (Akomodasi Perhotelan) di SMK Negeri 4 Malang berfokus pada pelayanan profesional perhotelan, reservasi kamar, front office, housekeeping, serta tata kelola akomodasi wisata.',
 'perhotelan akomodasi hotel front office housekeeping resepsionis pariwisata hospitality smkn 4 malang')
ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `keywords` = VALUES(`keywords`);

-- ==========================================
-- 2.3 SMK NEGERI 5 MALANG (school_id = 4)
-- ==========================================
INSERT INTO `school_majors` (`school_id`, `title`, `content`, `keywords`) VALUES
(4, 'Jurusan yang tersedia',
 'SMK Negeri 5 Malang memiliki beragam kompetensi keahlian unggulan di bidang industri kreatif seni kriya, desain busana, animasi, multimedia, serta teknologi informasi (RPL dan TKJ).',
 'jurusan program keahlian kompetensi smkn 5 smk 5 malang kriya batik keramik kayu busana animasi dkv tkj rpl'),

(4, 'Jurusan Rekayasa Perangkat Lunak (RPL)',
 'Rekayasa Perangkat Lunak (RPL / PPLG) di SMK Negeri 5 Malang berfokus pada pemrograman perangkat lunak komputer, aplikasi website, pengelolaan basis data, dan pengembangan aplikasi mobile.',
 'rpl rekayasa perangkat lunak pplg software pemrograman aplikasi web coding smkn 5 smk 5 malang'),

(4, 'Jurusan Teknik Komputer dan Jaringan (TKJ)',
 'Teknik Komputer dan Jaringan (TKJ / TJKT) di SMK Negeri 5 Malang berfokus pada teknik instalasi jaringan komputer, konfigurasi server, pemeliharaan komputer, dan sertifikasi LSP bidang jaringan.',
 'tkj teknik komputer jaringan tjkt lsp instalasi kabel jaringan server mikrotik smkn 5 smk 5 malang'),

(4, 'Jurusan Desain dan Produksi Kriya',
 'Desain dan Produksi Kriya di SMK Negeri 5 Malang merupakan jurusan unggulan bersertifikasi LSP dengan tiga bidang konsentrasi: Kriya Kreatif Batik dan Tekstil, Kriya Kreatif Keramik, serta Kriya Kreatif Kayu dan Rotan.',
 'kriya seni kriya kriya kreatif batik tekstil keramik gerabah kayu rotan lsp kerajinan seni smkn 5 malang'),

(4, 'Jurusan Busana (Tata Busana)',
 'Busana (Desain dan Produksi Busana) di SMK Negeri 5 Malang berfokus pada perancangan pola busana, seni desain fashion, teknik menjahit busana siap pakai (ready-to-wear), dan tata busana modern.',
 'busana tata busana desain busana fashion mode pola pakaian menjahit butik smkn 5 smk 5 malang'),

(4, 'Jurusan Animasi',
 'Animasi di SMK Negeri 5 Malang berfokus pada seni animasi visual, perancangan karakter 2D/3D, proses render animasi, dan pembuatan film animasi pendek yang berdaya saing industri.',
 'animasi animation 2d 3d karakter kartun cerita visual film pendek smkn 5 smk 5 malang'),

(4, 'Jurusan Desain Komunikasi Visual (DKV)',
 'Desain Komunikasi Visual (DKV) di SMK Negeri 5 Malang berfokus pada desain grafis, ilustrasi digital, tipografi, seni komunikasi visual, fotografi, dan perancangan materi promosi.',
 'dkv desain komunikasi visual ilustrasi desain grafis tipografi poster foto smkn 5 smk 5 malang'),

(4, 'Jurusan Multimedia',
 'Multimedia di SMK Negeri 5 Malang berfokus pada pembuatan dan penyuntingan konten media digital, video editing, audio, dan presentasi multimedia interaktif.',
 'multimedia konten digital video editing audio media interaktif smkn 5 smk 5 malang')
ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `keywords` = VALUES(`keywords`);

-- ==========================================
-- 2.4 SMK NEGERI 3 MALANG (school_id = 2)
-- ==========================================
INSERT INTO `school_majors` (`school_id`, `title`, `content`, `keywords`) VALUES
(2, 'Jurusan yang tersedia',
 'SMK Negeri 3 Malang memiliki kompetensi keahlian di bidang pariwisata, kuliner, busana, kecantikan, dan teknologi informasi: Tata Boga, Tata Busana, Tata Kecantikan Kulit dan Rambut, Perhotelan, dan TKJ.',
 'jurusan program keahlian kompetensi smkn 3 smk 3 malang tata boga tata busana kecantikan perhotelan tkj'),

(2, 'Jurusan Tata Boga (Kuliner)',
 'Tata Boga (Kuliner) di SMK Negeri 3 Malang berfokus pada pengolahan makanan khas Indonesia dan internasional, tata hidang, pembuatan kue/pastry & bakery, serta manajemen usaha kuliner.',
 'tata boga kuliner memasak masak bakery pastry kue restoran masakan chef smkn 3 smk 3 malang'),

(2, 'Jurusan Tata Busana',
 'Tata Busana (Desain Busana) di SMK Negeri 3 Malang berfokus pada perancangan desain mode busana, pembuatan pola pakaian wanita/pria, teknik menjahit tingkat mahir, dan penyelenggaraan fashion show.',
 'tata busana busana fashion mode menjahit pola baju gaun pakaian desainer smkn 3 smk 3 malang'),

(2, 'Jurusan Tata Kecantikan Kulit dan Rambut',
 'Tata Kecantikan Kulit dan Rambut di SMK Negeri 3 Malang berfokus pada perawatan kecantikan wajah dan kulit, seni tata rias make-up artist (MUA), pemangkasan dan penataan rambut, serta terapi spa.',
 'tata kecantikan kulit rambut mua makeup rias pengantin perawatan spa salon kecantikan smkn 3 malang'),

(2, 'Jurusan Perhotelan',
 'Perhotelan (Akomodasi Perhotelan) di SMK Negeri 3 Malang berfokus pada operasional hotel berbintang, layanan front office, penataan kamar (housekeeping), dan etika pelayanan hospitality internasional.',
 'perhotelan akomodasi hotel front office housekeeping resepsionis pariwisata smkn 3 smk 3 malang'),

(2, 'Jurusan Teknik Komputer dan Jaringan (TKJ)',
 'Teknik Komputer dan Jaringan (TKJ / TJKT) di SMK Negeri 3 Malang berfokus pada instalasi jaringan, administrasi sistem komputer, dan pemeliharaan perangkat jaringan.',
 'tkj teknik komputer jaringan tjkt network lan wan server komputer smkn 3 smk 3 malang')
ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `keywords` = VALUES(`keywords`);

-- ==========================================
-- 2.5 SMK NEGERI 6 MALANG (school_id = 5)
-- ==========================================
INSERT INTO `school_majors` (`school_id`, `title`, `content`, `keywords`) VALUES
(5, 'Jurusan yang tersedia',
 'SMK Negeri 6 Malang adalah SMK teknik yang memiliki kompetensi keahlian di bidang keteknikan dan IT: RPL, TKJ, SIJA, Teknik Mesin (Pemesinan), Otomotif (TKR dan Ototronik), Listrik (TITL), Alat Berat, serta Bangunan (DPIB dan KJIJ).',
 'jurusan program keahlian kompetensi smkn 6 smk 6 malang teknik mesin listrik otomotif rpl tkj sija dpib'),

(5, 'Jurusan Rekayasa Perangkat Lunak (RPL)',
 'Rekayasa Perangkat Lunak (RPL) di SMK Negeri 6 Malang berfokus pada perancangan dan pembuatan perangkat lunak, aplikasi komputer, pemrograman web, dan basis data.',
 'rpl rekayasa perangkat lunak software pemrograman coding aplikasi smkn 6 smk 6 malang'),

(5, 'Jurusan Teknik Komputer dan Jaringan (TKJ)',
 'Teknik Komputer dan Jaringan (TKJ) di SMK Negeri 6 Malang berfokus pada perancangan infrastruktur jaringan komputer, routing protokol, dan administrasi server.',
 'tkj teknik komputer jaringan network server routing lan wan smkn 6 smk 6 malang'),

(5, 'Jurusan Sistem Informatika, Jaringan dan Aplikasi (SIJA)',
 'Sistem Informatika, Jaringan dan Aplikasi (SIJA - program 4 tahun) memadukan infrastruktur jaringan terdistribusi, komputasi awan (cloud computing), Internet of Things (IoT), dan rekayasa aplikasi.',
 'sija sistem informatika jaringan aplikasi cloud computing iot 4 tahun smkn 6 smk 6 malang'),

(5, 'Jurusan Teknik Otomotif (TKR & Ototronik)',
 'Teknik Otomotif di SMK Negeri 6 Malang mencakup Teknik Kendaraan Ringan Otomotif (TKR) untuk servis mesin kendaraan dan Teknik Ototronik untuk sistem kelistrikan dan komputerisasi otomotif modern.',
 'otomotif tkr teknik kendaraan ringan ototronik mesin mobil kelistrikan otomotif smkn 6 malang'),

(5, 'Jurusan Teknik Pemesinan (TPM)',
 'Teknik Pemesinan di SMK Negeri 6 Malang berfokus pada pengoperasian mesin bubut, mesin frais/milling, gerinda, serta pemrograman mesin CNC presisi tinggi.',
 'teknik pemesinan mesin bubut frais milling cnc manufaktur logam smkn 6 smk 6 malang'),

(5, 'Jurusan Teknik Instalasi Tenaga Listrik (TITL)',
 'Teknik Instalasi Tenaga Listrik (TITL) di SMK Negeri 6 Malang berfokus pada instalasi penerangan gedung, instalasi tenaga motor listrik industri, dan sistem proteksi kelistrikan.',
 'listrik titl instalasi tenaga listrik kelistrikan industri panel motor listrik smkn 6 malang'),

(5, 'Jurusan Bangunan Sipil & DPIB',
 'Bidang konstruksi di SMK Negeri 6 Malang meliputi Desain Pemodelan dan Informasi Bangunan (DPIB - arsitektur/BIM) serta Konstruksi Jalan, Irigasi dan Jembatan (KJIJ - teknik sipil lapangan).',
 'dpib kjij bangunan sipil arsitektur gambar teknik konstruksi jalan jembatan irigasi bim smkn 6 malang'),

(5, 'Jurusan Teknik Alat Berat (TAB)',
 'Teknik Alat Berat di SMK Negeri 6 Malang berfokus pada perawatan, pemeliharaan sistem hidrolik, dan overhaul mesin alat berat industri pertambangan dan konstruksi.',
 'alat berat tab excavator bulldozer hidrolik diesel overhaul mesin industri smkn 6 malang')
ON DUPLICATE KEY UPDATE `content` = VALUES(`content`), `keywords` = VALUES(`keywords`);

SELECT 'Update data school_majors berhasil selesai.' AS status;
