-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for chatbot_sekolah
CREATE DATABASE IF NOT EXISTS `chatbot_sekolah` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `chatbot_sekolah`;

-- Dumping structure for table chatbot_sekolah.knowledge
CREATE TABLE IF NOT EXISTS `knowledge` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int unsigned NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `keywords` text COLLATE utf8mb4_unicode_ci COMMENT 'kata kunci/sinonim untuk membantu pencarian',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_school_title` (`school_id`,`title`),
  CONSTRAINT `fk_knowledge_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table chatbot_sekolah.knowledge: ~49 rows (approximately)
INSERT INTO `knowledge` (`id`, `school_id`, `category`, `title`, `content`, `keywords`, `updated_at`) VALUES
	(1, 1, 'Profil', 'Profil singkat SMK Telkom Malang', 'SMK Telkom Malang adalah sekolah menengah kejuruan swasta di bawah naungan Yayasan Pendidikan Telkom (YPT) yang berfokus pada bidang teknologi informasi. Sekolah ini berdiri pada 14 Juni 1992 dan dikenal sebagai pelopor SMK informatika di Indonesia. Nama resminya dulu SMK Telkom Sandhy Putra Malang, lalu menjadi SMK Telkom Malang setelah rebranding sekolah-sekolah Telkom pada 2014. Siswanya dijuluki Mokleters, dari kata Moklet yang merupakan kebalikan dari Telkom.', 'profil sekolah tentang sejarah berdiri didirikan 1992 moklet mokleters sandhy putra yayasan ypt telkom swasta apa itu', '2026-11-19 02:00:00'),
	(2, 1, 'Profil', 'Akreditasi, standar mutu, dan kurikulum', 'SMK Telkom Malang terakreditasi A, memiliki standar mutu ISO 9001:2015, dan berstatus sekolah Adiwiyata (sekolah peduli lingkungan). Kurikulum yang dipakai adalah Kurikulum Merdeka.', 'akreditasi a iso 9001 mutu adiwiyata kurikulum merdeka sertifikasi kualitas bagus terbaik', '2026-11-19 02:00:00'),
	(3, 1, 'Profil', 'Kepala sekolah', 'Kepala SMK Telkom Malang adalah Rahmat Dwi Djatmiko.', 'kepala sekolah kasek kepsek pimpinan siapa rahmat djatmiko jatmiko', '2026-11-19 02:00:00'),
	(4, 1, 'Profil', 'Jumlah siswa dan kelas', 'SMK Telkom Malang memiliki lebih dari 1.400 siswa dari kelas X, XI, dan XII. Sekolah menyediakan sekitar 14 kelas untuk setiap angkatan.', 'jumlah siswa murid berapa kelas angkatan rombel besar', '2026-11-19 02:00:00'),
	(5, 1, 'Jurusan', 'Jurusan yang tersedia', 'SMK Telkom Malang memiliki tiga jurusan: Rekayasa Perangkat Lunak (RPL), Teknik Komputer dan Jaringan (TKJ), dan Pengembangan Gim (PG). Sekolah ini awalnya hanya punya satu jurusan Teknologi Informasi, lalu pada 2005 menjadi RPL dan TKJ. Jurusan Pengembangan Gim baru dibuka pada 2024.', 'jurusan konsentrasi keahlian program studi pilihan apa saja rpl tkj pg pengembangan gim game ada berapa', '2026-11-19 02:00:00'),
	(6, 1, 'Jurusan', 'Jurusan Rekayasa Perangkat Lunak (RPL)', 'Rekayasa Perangkat Lunak (RPL) berfokus pada pembuatan aplikasi dan perangkat lunak. Siswa belajar pemrograman dan pengembangan aplikasi. Lulusan bisa berkarier sebagai programmer atau developer, seperti full stack developer.', 'rpl rekayasa perangkat lunak software programmer pemrograman coding aplikasi developer web mobile ngoding', '2026-11-19 02:00:00'),
	(7, 1, 'Jurusan', 'Jurusan Teknik Komputer dan Jaringan (TKJ)', 'Teknik Komputer dan Jaringan (TKJ) berfokus pada komputer dan jaringan. Lulusan berpeluang bekerja di bidang infrastruktur jaringan, misalnya sebagai network engineer.', 'tkj teknik komputer jaringan network engineer infrastruktur server internet kabel perakitan', '2026-11-19 02:00:00'),
	(8, 1, 'Jurusan', 'Jurusan Pengembangan Gim (PG)', 'Pengembangan Gim (PG) adalah jurusan baru yang dibuka pada 2024 untuk siswa yang ingin menjadi kreator game. Siswa belajar proses pembuatan game, mulai dari merancang konsep cerita dan level, membuat aset grafis 2D dan 3D, hingga pemrograman. Sekolah menyiapkan fasilitas Game Station untuk mendukung pembelajaran.', 'pg pengembangan gim game gamedev game developer membuat game grafis 2d 3d level design game station pplg', '2026-11-19 02:00:00'),
	(9, 1, 'Jurusan', 'Komposisi kelas per jurusan dan kuota', 'Pada penerimaan siswa baru tahun ajaran 2025/2026, SMK Telkom Malang merencanakan 14 kelas, yaitu 8 kelas RPL, 4 kelas TKJ, dan 2 kelas PG. Jurusan RPL memiliki kelas paling banyak.', 'kuota daya tampung jumlah kelas per jurusan rpl tkj pg komposisi peminat favorit', '2026-11-19 02:00:00'),
	(10, 1, 'Jurusan', 'Pemetaan minat dan bakat (Entry Level Assessment)', 'SMK Telkom Malang menggelar Entry Level Assessment (ELA) bersama GuruInovatif.id pada 13 Juli 2026, diikuti 470 peserta didik. Asesmen ini memetakan potensi siswa dan kecocokannya dengan bidang kejuruan. Hasilnya dipakai sekolah sebagai dasar pengambilan keputusan.', 'ela entry level assessment tes minat bakat pemetaan potensi cocok jurusan memilih guruinovatif', '2026-11-19 02:00:00'),
	(11, 1, 'Pendaftaran', 'Informasi pendaftaran siswa baru (PPDB)', 'Pendaftaran siswa baru SMK Telkom Malang dilakukan secara online lewat situs PPDB sekolah di ppdb.smktelkom-mlg.sch.id. Jadwal dan ketentuan tahun berjalan diumumkan di situs tersebut. Untuk menanyakan langsung, hubungi call center sekolah di 0812-2348-8999. Pada penerimaan 2025/2026, sekolah membuka pendaftaran awal bagi siswa kelas 8 lewat program Moklet Pass Priority Programme (MP3) yang diluncurkan 6 Juni 2024.', 'ppdb pendaftaran daftar siswa baru penerimaan spmb cara mendaftar jadwal gelombang online website mp3 moklet pass registrasi', '2026-11-19 02:00:00'),
	(12, 1, 'Pendaftaran', 'Tahapan seleksi masuk', 'Pada pelaksanaan PPDB sebelumnya, seleksi terdiri dari tes akademik (Bahasa Inggris dan Matematika) serta tes non-akademik berupa wawancara siswa, wawancara orang tua, dan tes kesamaptaan (kebugaran). Ketentuan tahun berjalan dapat berbeda, jadi cek situs PPDB sekolah.', 'seleksi tes ujian masuk syarat wawancara kesamaptaan akademik matematika bahasa inggris jalur persyaratan', '2026-11-19 02:00:00'),
	(13, 1, 'Pendaftaran', 'Biaya pendaftaran dan biaya sekolah', 'Rincian biaya pendaftaran, uang masuk, dan SPP belum tersedia di data kami. Informasi biaya yang resmi dapat dilihat di situs PPDB sekolah (ppdb.smktelkom-mlg.sch.id) atau ditanyakan langsung ke call center sekolah di 0812-2348-8999.', 'biaya spp uang masuk uang gedung bayar mahal murah tarif harga pendaftaran beasiswa cicilan administrasi', '2026-11-19 02:00:00'),
	(14, 1, 'Kegiatan', 'Ekstrakurikuler', 'Ekstrakurikuler di SMK Telkom Malang antara lain bola basket, bola voli, futsal, pencak silat, Paskibraka, Palang Merah Remaja (PMR), English Conversation, Marketing Online, serta ekskul bertema game dan pembuatan game.', 'ekskul ekstrakurikuler kegiatan siswa basket voli futsal pencak silat paskibra paskibraka pmr english marketing game esports mlbb pubg organisasi', '2026-11-19 02:00:00'),
	(15, 1, 'Kegiatan', 'Pelatihan digital dan lomba untuk siswa SMP', 'Pada Dies Natalis ke-32, SMK Telkom Malang mengadakan pelatihan digital untuk 162 siswa SMP/MTs. Pesertanya bisa memilih salah satu dari enam pelatihan: AI, pengembangan gim, desain grafis, cyber security, pembuatan web, dan robotik. Sekolah juga rutin menggelar acara seperti Moklet Youth Digitalent (MYD) dan Moklet Idea Challenge (MIC).', 'pelatihan workshop smp dies natalis moklet youth digitalent myd idea challenge mic lomba acara kunjungan ai robotik cyber security desain grafis', '2026-11-19 02:00:00'),
	(16, 1, 'Fasilitas', 'Fasilitas dan inkubator wirausaha', 'SMK Telkom Malang menyediakan Game Station untuk jurusan Pengembangan Gim. Sekolah juga merancang Malang Techno Park sebagai inkubator kewirausahaan siswa.', 'fasilitas sarana prasarana lab laboratorium game station malang techno park inkubator wirausaha gedung ruang', '2026-11-19 02:00:00'),
	(17, 1, 'Fasilitas', 'Prospek lulusan dan kerja sama industri', 'Lulusan SMK Telkom Malang disiapkan lewat tiga jalur: Bekerja, Meneruskan kuliah, dan Wirausaha (BMW), masing-masing dengan mitra. Pada Januari 2026, Telkom menggandeng perusahaan teknologi global di SMK Telkom Malang untuk memperkuat kurikulum, pelatihan, dan sertifikasi internasional. Sekolah juga bekerja sama dengan pihak seperti Ngalup Collaborative Network dan Jagoan Hosting untuk pelatihan profesi dan wirausaha digital.', 'lulusan alumni prospek karir kerja kuliah wirausaha bmw mitra industri kerjasama sertifikasi sertifikat telkom beasiswa magang prakerin', '2026-11-19 02:00:00'),
	(18, 1, 'Kontak', 'Alamat dan lokasi', 'SMK Telkom Malang beralamat di Jl. Danau Ranau No. 01, Sawojajar, Kecamatan Kedungkandang, Kota Malang, Jawa Timur 65139.', 'alamat lokasi dimana letak maps sawojajar danau ranau kedungkandang malang rute', '2026-11-19 02:00:00'),
	(19, 1, 'Kontak', 'Kontak dan media sosial', 'Call center SMK Telkom Malang: 0812-2348-8999 (juga bisa lewat WhatsApp). Telepon kantor: 0341-712500. Email: info@smktelkom-mlg.sch.id. Website: smktelkom-mlg.sch.id. Instagram dan TikTok: @smktelkommalang.', 'kontak hubungi telepon telpon wa whatsapp email website instagram tiktok ig call center nomor cs admin', '2026-11-19 02:00:00'),
	(20, 1, 'Kontak', 'Jam layanan', 'Jam layanan informasi SMK Telkom Malang adalah Senin sampai Sabtu pukul 06.00 sampai 16.00 WIB. Hari Minggu tutup.', 'jam buka tutup layanan operasional kantor hari senin sabtu minggu waktu kapan', '2026-11-19 02:00:00'),
	(21, 2, 'Profil', 'Profil singkat SMK Negeri 3 Malang', 'SMK Negeri 3 Malang adalah sekolah menengah kejuruan negeri di Kota Malang dengan akreditasi A (NPSN 20533815). Sekolah ini berdiri pada 1977, memakai Kurikulum SMK Merdeka, dan menyelenggarakan pembelajaran sehari penuh lima hari seminggu. Sekolah dibina oleh Cabang Dinas Pendidikan Wilayah Kota Malang dan Kota Batu.', 'profil sekolah tentang sejarah berdiri 1977 negeri akreditasi a npsn kurikulum merdeka sehari penuh lima hari cabang dinas', '2026-11-19 02:00:00'),
	(22, 2, 'Jurusan', 'Jurusan di SMK Negeri 3 Malang', 'SMK Negeri 3 Malang memiliki kompetensi keahlian di bidang tata boga (kuliner), tata busana (busana, desain fesyen, desain dan produksi busana), tata kecantikan kulit dan rambut (kecantikan dan spa), perhotelan (akomodasi perhotelan), serta Teknik Komputer dan Jaringan (TKJ, juga disebut Teknik Jaringan Komputer dan Telekomunikasi). Nama kompetensi mengikuti Kurikulum Merdeka sehingga bisa berbeda dari penyebutan lama.', 'jurusan program keahlian kompetensi tata boga kuliner busana fesyen kecantikan spa perhotelan akomodasi tkj teknik komputer jaringan tjkt telekomunikasi memasak tata rias hotel', '2026-11-19 02:00:00'),
	(23, 2, 'Profil', 'Kepala SMK Negeri 3 Malang', 'Kepala SMK Negeri 3 Malang adalah Vivi Afianty, S.Pd., MM.', 'kepala sekolah kasek kepsek pimpinan siapa vivi afianty', '2026-11-19 02:00:00'),
	(24, 2, 'Fasilitas', 'Statistik dan fasilitas SMK Negeri 3 Malang', 'Menurut data Kemendikdasmen (semester gasal 2026/2027), SMK Negeri 3 Malang memiliki 64 guru dan 1.581 siswa (384 laki-laki dan 1.197 perempuan) dalam 48 rombongan belajar. Fasilitasnya mencakup 21 ruang kelas, 3 laboratorium, dan 1 perpustakaan di lahan seluas 5.650 meter persegi, dengan akses internet dedicated.', 'jumlah siswa guru murid rombel kelas ruang kelas laboratorium lab perpustakaan fasilitas sarana prasarana luas lahan internet statistik', '2026-11-19 02:00:00'),
	(25, 2, 'Pendaftaran', 'Informasi pendaftaran SMK Negeri 3 Malang', 'Informasi pendaftaran siswa baru (jadwal, syarat, dan jalur) SMK Negeri 3 Malang untuk tahun berjalan diumumkan lewat situs resmi sekolah smkn3malang.sch.id dan Dinas Pendidikan Provinsi Jawa Timur. Calon siswa juga bisa bertanya langsung lewat telepon sekolah (0341) 551734. Rincian biaya dan jadwal tahun berjalan tidak tersedia di data kami.', 'ppdb spmb pendaftaran daftar siswa baru penerimaan cara mendaftar jadwal syarat jalur seleksi registrasi masuk biaya spp uang masuk gratis negeri', '2026-11-19 02:00:00'),
	(26, 2, 'Kontak', 'Alamat SMK Negeri 3 Malang', 'SMK Negeri 3 Malang beralamat di Jl. Surabaya No. 1, Gadingkasri, Kecamatan Klojen, Kota Malang, Jawa Timur 65115.', 'alamat lokasi dimana letak maps surabaya gadingkasri klojen malang kode pos rute', '2026-11-19 02:00:00'),
	(27, 2, 'Kontak', 'Kontak SMK Negeri 3 Malang', 'Kontak SMK Negeri 3 Malang: telepon (0341) 551734, fax 0341-586395, email smkn3_mlg@yahoo.co.id, website smkn3malang.sch.id.', 'kontak hubungi telepon telpon fax email website nomor cs admin', '2026-11-19 02:00:00'),
	(28, 3, 'Profil', 'Profil singkat SMK Negeri 4 Malang', 'SMK Negeri 4 Malang berdiri pada 26 Mei 1979 dan terakreditasi A (NPSN 20533816). Sekolah ini dikenal sebagai sekolah grafika (teknik percetakan) pertama di Malang, memiliki sistem manajemen mutu ISO 9001 sejak 2008, dan memakai Kurikulum SMK Merdeka. Bidang keahlian Animasi mulai dibuka pada 2006.', 'profil sekolah tentang sejarah berdiri 1979 grafika percetakan negeri akreditasi a npsn iso 9001 mutu kurikulum merdeka animasi', '2026-11-19 02:00:00'),
	(29, 3, 'Jurusan', 'Jurusan di SMK Negeri 4 Malang', 'SMK Negeri 4 Malang memiliki banyak kompetensi keahlian, antara lain Desain Grafika, Produksi Grafika (Teknik Grafika), Multimedia, Animasi, Desain Komunikasi Visual (DKV), Rekayasa Perangkat Lunak (RPL), Pengembangan Perangkat Lunak dan Gim, Teknik Komputer dan Jaringan (TKJ, juga disebut Teknik Jaringan Komputer dan Telekomunikasi), Teknik Mekatronika, Teknik Elektronika, Teknik Logistik, dan Perhotelan.', 'jurusan program keahlian kompetensi grafika percetakan multimedia animasi dkv desain komunikasi visual rpl pplg gim game tkj tjkt mekatronika elektronika logistik perhotelan software coding', '2026-11-19 02:00:00'),
	(30, 3, 'Profil', 'Kepala SMK Negeri 4 Malang', 'Kepala SMK Negeri 4 Malang adalah Drs. Gunawan Dwiyono, S.ST., M.Pd.', 'kepala sekolah kasek kepsek pimpinan siapa gunawan dwiyono', '2026-11-19 02:00:00'),
	(31, 3, 'Fasilitas', 'Statistik dan fasilitas SMK Negeri 4 Malang', 'Menurut data Kemendikdasmen (semester gasal 2026/2027), SMK Negeri 4 Malang memiliki 101 guru dan 2.550 siswa (1.455 laki-laki dan 1.095 perempuan) dalam 75 rombongan belajar. Fasilitasnya mencakup 49 ruang kelas, 2 laboratorium, dan 1 perpustakaan di lahan seluas 14.000 meter persegi, dengan akses internet dedicated. Pembelajaran berlangsung pagi, lima hari seminggu.', 'jumlah siswa guru murid rombel kelas ruang kelas laboratorium lab perpustakaan fasilitas sarana prasarana luas lahan internet statistik pagi', '2026-11-19 02:00:00'),
	(32, 3, 'Pendaftaran', 'Informasi pendaftaran SMK Negeri 4 Malang', 'Informasi pendaftaran siswa baru (jadwal, syarat, dan jalur) SMK Negeri 4 Malang untuk tahun berjalan diumumkan lewat situs resmi sekolah smkn4malang.sch.id dan Dinas Pendidikan Provinsi Jawa Timur. Calon siswa juga bisa bertanya lewat telepon sekolah 0341-353798. Rincian biaya dan jadwal tahun berjalan tidak tersedia di data kami.', 'ppdb spmb pendaftaran daftar siswa baru penerimaan cara mendaftar jadwal syarat jalur seleksi registrasi masuk biaya spp uang masuk gratis negeri', '2026-11-19 02:00:00'),
	(33, 3, 'Kontak', 'Alamat SMK Negeri 4 Malang', 'SMK Negeri 4 Malang beralamat di Jl. Tanimbar No. 22, Kasin, Kecamatan Klojen, Kota Malang, Jawa Timur 65117.', 'alamat lokasi dimana letak maps tanimbar kasin klojen malang kode pos rute', '2026-11-19 02:00:00'),
	(34, 3, 'Kontak', 'Kontak SMK Negeri 4 Malang', 'Kontak SMK Negeri 4 Malang: telepon 0341-353798, email mail@smkn4malang.sch.id, website smkn4malang.sch.id.', 'kontak hubungi telepon telpon email website nomor cs admin', '2026-11-19 02:00:00'),
	(35, 4, 'Profil', 'Profil singkat SMK Negeri 5 Malang', 'SMK Negeri 5 Malang berdiri pada 1998 di atas lahan sekitar 13.816 meter persegi dan terakreditasi A (NPSN 20533817). Mottonya Cerdas, Terampil, Kompetitif. Sekolah memakai Kurikulum Merdeka dan metode pembelajaran Competency Based Training serta Production Based Training. Visinya mewujudkan lulusan unggul, kompeten, berdaya saing, berbasis keunggulan lokal, berbudaya lingkungan, dan berwawasan global.', 'profil sekolah tentang sejarah berdiri 1998 negeri akreditasi a npsn motto cerdas terampil kompetitif visi kurikulum merdeka lahan', '2026-11-19 02:00:00'),
	(36, 4, 'Jurusan', 'Jurusan di SMK Negeri 5 Malang', 'SMK Negeri 5 Malang memiliki kompetensi keahlian di bidang kriya dan busana serta teknologi informasi: Desain dan Produksi Kriya (Kriya Kreatif Batik dan Tekstil, Kriya Kreatif Keramik, dan Kriya Kreatif Kayu dan Rotan), Busana (Desain dan Produksi Busana), Animasi, Desain Komunikasi Visual (DKV), Multimedia, Pengembangan Perangkat Lunak dan Gim, Rekayasa Perangkat Lunak (RPL), serta Teknik Komputer dan Jaringan (TKJ, juga disebut Teknik Jaringan Komputer dan Telekomunikasi).', 'jurusan program keahlian kompetensi kriya batik tekstil keramik kayu rotan busana butik tata busana animasi dkv desain komunikasi visual multimedia rpl pplg gim game tkj tjkt software coding', '2026-11-19 02:00:00'),
	(37, 4, 'Profil', 'Kepala SMK Negeri 5 Malang', 'Kepala SMK Negeri 5 Malang adalah Budi Purwanto, S.Pd., M.M.', 'kepala sekolah kasek kepsek pimpinan siapa budi purwanto', '2026-11-19 02:00:00'),
	(38, 4, 'Kegiatan', 'Ekstrakurikuler SMK Negeri 5 Malang', 'Ekstrakurikuler di SMK Negeri 5 Malang antara lain pramuka, Paskibraka, bela diri, dance, dan teater komedi kontemporer.', 'ekskul ekstrakurikuler kegiatan siswa pramuka paskibra paskibraka beladiri bela diri dance tari teater komedi organisasi', '2026-11-19 02:00:00'),
	(39, 4, 'Fasilitas', 'Sertifikasi kompetensi (LSP) SMK Negeri 5 Malang', 'SMK Negeri 5 Malang memiliki Lembaga Sertifikasi Profesi (LSP) sendiri untuk uji sertifikasi kompetensi siswa, antara lain pada kompetensi keahlian Kriya Kreatif Keramik, Kriya Kreatif Kayu dan Rotan, dan Teknik Komputer dan Jaringan.', 'lsp sertifikasi sertifikat kompetensi uji bnsp profesi keramik kayu rotan tkj', '2026-11-19 02:00:00'),
	(40, 4, 'Pendaftaran', 'Informasi pendaftaran SMK Negeri 5 Malang', 'Informasi pendaftaran siswa baru (jadwal, syarat, dan jalur) SMK Negeri 5 Malang untuk tahun berjalan diumumkan lewat situs resmi sekolah smkn5malang.sch.id (ada halaman PPDB) dan Dinas Pendidikan Provinsi Jawa Timur. Calon siswa juga bisa bertanya lewat telepon sekolah (0341) 478195. Rincian biaya dan jadwal tahun berjalan tidak tersedia di data kami.', 'ppdb spmb pendaftaran daftar siswa baru penerimaan cara mendaftar jadwal syarat jalur seleksi registrasi masuk biaya spp uang masuk gratis negeri', '2026-11-19 02:00:00'),
	(41, 4, 'Kontak', 'Alamat SMK Negeri 5 Malang', 'SMK Negeri 5 Malang beralamat di Jl. Ikan Piranha Atas (tercatat juga Jl. Ikan Piranha No. 50), Tunjungsekar, Kecamatan Lowokwaru, Kota Malang, Jawa Timur 65142.', 'alamat lokasi dimana letak maps ikan piranha tunjungsekar lowokwaru malang kode pos rute', '2026-11-19 02:00:00'),
	(42, 4, 'Kontak', 'Kontak SMK Negeri 5 Malang', 'Kontak SMK Negeri 5 Malang: telepon (0341) 478195, email info@smkn5malang.sch.id, website smkn5malang.sch.id.', 'kontak hubungi telepon telpon email website nomor cs admin', '2026-11-19 02:00:00'),
	(43, 5, 'Profil', 'Profil singkat SMK Negeri 6 Malang', 'SMK Negeri 6 Malang adalah SMK negeri berbasis teknologi dan rekayasa (teknik) di Kota Malang, terakreditasi A (NPSN 20533818). Sekolah berdiri pada 2002 (SK Direktur Dikmenjur tertanggal 5 Agustus 2002) setelah STM Negeri Malang pindah ke Singosari sehingga Kota Malang membutuhkan SMK teknik. Sekolah memakai Kurikulum Merdeka dengan pembelajaran sehari penuh lima hari seminggu.', 'profil sekolah tentang sejarah berdiri 2002 negeri teknik teknologi rekayasa akreditasi a npsn kurikulum merdeka sehari penuh stm', '2026-11-19 02:00:00'),
	(44, 5, 'Jurusan', 'Jurusan di SMK Negeri 6 Malang', 'SMK Negeri 6 Malang memiliki kompetensi keahlian bidang teknik dan teknologi informasi: Teknik Instalasi Tenaga Listrik (Teknik Ketenagalistrikan), Teknik Pemesinan (Teknik Mesin), Teknik Kendaraan Ringan Otomotif (Teknik Otomotif), Teknik Ototronik, Teknik Alat Berat, Desain Pemodelan dan Informasi Bangunan (DPIB), Konstruksi Jalan, Irigasi dan Jembatan (Konstruksi dan Perawatan Bangunan Sipil), Rekayasa Perangkat Lunak (RPL), Teknik Komputer dan Jaringan (TKJ), dan Sistem Informatika, Jaringan dan Aplikasi (SIJA).', 'jurusan program keahlian kompetensi teknik listrik titl pemesinan mesin tkr otomotif otomotif ototronik alat berat dpib bangunan gambar konstruksi jalan irigasi jembatan sipil rpl pplg tkj tjkt sija software coding las bubut', '2026-11-19 02:00:00'),
	(45, 5, 'Profil', 'Kepala SMK Negeri 6 Malang', 'Kepala SMK Negeri 6 Malang adalah Mohammad Taufik (menurut data per pertengahan 2026).', 'kepala sekolah kasek kepsek pimpinan siapa mohammad taufik', '2026-11-19 02:00:00'),
	(46, 5, 'Kegiatan', 'Ekstrakurikuler SMK Negeri 6 Malang', 'Ekstrakurikuler di SMK Negeri 6 Malang antara lain Paskibraka, Pramuka, Polisi Taruna, Ecosmart, Pecinta Alam, Badan Dakwah Islam, futsal, dan basket.', 'ekskul ekstrakurikuler kegiatan siswa paskibra paskibraka pramuka polisi taruna ecosmart pecinta alam badan dakwah islam rohis futsal basket organisasi', '2026-11-19 02:00:00'),
	(47, 5, 'Pendaftaran', 'Informasi pendaftaran SMK Negeri 6 Malang', 'Informasi pendaftaran siswa baru (jadwal, syarat, dan jalur) SMK Negeri 6 Malang untuk tahun berjalan diumumkan lewat situs resmi sekolah smkn6malang.sch.id dan Dinas Pendidikan Provinsi Jawa Timur. Calon siswa juga bisa bertanya lewat telepon sekolah (0341) 722216. Rincian biaya dan jadwal tahun berjalan tidak tersedia di data kami.', 'ppdb spmb pendaftaran daftar siswa baru penerimaan cara mendaftar jadwal syarat jalur seleksi registrasi masuk biaya spp uang masuk gratis negeri', '2026-11-19 02:00:00'),
	(48, 5, 'Kontak', 'Alamat SMK Negeri 6 Malang', 'SMK Negeri 6 Malang beralamat di Jl. Ki Ageng Gribig No. 28, Madyopuro, Kecamatan Kedungkandang, Kota Malang, Jawa Timur 65139.', 'alamat lokasi dimana letak maps ki ageng gribig madyopuro kedungkandang malang kode pos rute', '2026-11-19 02:00:00'),
	(49, 5, 'Kontak', 'Kontak SMK Negeri 6 Malang', 'Kontak SMK Negeri 6 Malang: telepon (0341) 722216, fax 0341-720138, email info@smkn6malang.sch.id, website smkn6malang.sch.id.', 'kontak hubungi telepon telpon fax email website nomor cs admin', '2026-11-19 02:00:00');

-- Dumping structure for table chatbot_sekolah.knowledge_pending
CREATE TABLE IF NOT EXISTS `knowledge_pending` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int unsigned NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'pertanyaan yang sudah dinormalisasi, untuk mengenali pertanyaan sama',
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sources` text COLLATE utf8mb4_unicode_ci COMMENT 'JSON daftar sumber web [{title,url}]',
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pending` (`school_id`,`question_key`),
  CONSTRAINT `fk_pending_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table chatbot_sekolah.knowledge_pending: ~0 rows (approximately)

-- Dumping structure for table chatbot_sekolah.schools
CREATE TABLE IF NOT EXISTS `schools` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aliases` text COLLATE utf8mb4_unicode_ci COMMENT 'nama lain/singkatan, pisahkan dengan koma',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_school_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table chatbot_sekolah.schools: ~5 rows (approximately)
INSERT INTO `schools` (`id`, `name`, `aliases`) VALUES
	(1, 'SMK Telkom Malang', 'smk telkom, telkom malang, telkom, moklet, mokleters, sandhy putra, smk telkom sandhy putra malang'),
	(2, 'SMK Negeri 3 Malang', 'smkn 3 malang, smk 3 malang, smkn3 malang, smk negeri 3, smkn 3, smk 3, smkn3'),
	(3, 'SMK Negeri 4 Malang', 'smkn 4 malang, smk 4 malang, smkn4 malang, smk negeri 4, smkn 4, smk 4, smkn4, smk grafika malang, grafika malang'),
	(4, 'SMK Negeri 5 Malang', 'smkn 5 malang, smk 5 malang, smkn5 malang, smk negeri 5, smkn 5, smk 5, smkn5'),
	(5, 'SMK Negeri 6 Malang', 'smkn 6 malang, smk 6 malang, smkn6 malang, smk negeri 6, smkn 6, smk 6, smkn6');

-- Dumping structure for table chatbot_sekolah.school_activities
CREATE TABLE IF NOT EXISTS `school_activities` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int unsigned NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `keywords` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_activity` (`school_id`,`title`),
  CONSTRAINT `fk_activity_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table chatbot_sekolah.school_activities: ~4 rows (approximately)
INSERT INTO `school_activities` (`id`, `school_id`, `title`, `content`, `keywords`, `updated_at`) VALUES
	(1, 1, 'Ekstrakurikuler', 'Ekstrakurikuler di SMK Telkom Malang antara lain bola basket, bola voli, futsal, pencak silat, Paskibraka, Palang Merah Remaja (PMR), English Conversation, Marketing Online, serta ekskul bertema game dan pembuatan game.', 'ekskul ekstrakurikuler kegiatan siswa basket voli futsal pencak silat paskibra paskibraka pmr english marketing game esports mlbb pubg organisasi', '2026-11-19 08:26:05'),
	(2, 1, 'Pelatihan digital dan lomba untuk siswa SMP', 'Pada Dies Natalis ke-32, SMK Telkom Malang mengadakan pelatihan digital untuk 162 siswa SMP/MTs. Pesertanya bisa memilih salah satu dari enam pelatihan: AI, pengembangan gim, desain grafis, cyber security, pembuatan web, dan robotik. Sekolah juga rutin menggelar acara seperti Moklet Youth Digitalent (MYD) dan Moklet Idea Challenge (MIC).', 'pelatihan workshop smp dies natalis moklet youth digitalent myd idea challenge mic lomba acara kunjungan ai robotik cyber security desain grafis', '2026-11-19 08:26:05'),
	(3, 4, 'Ekstrakurikuler SMK Negeri 5 Malang', 'Ekstrakurikuler di SMK Negeri 5 Malang antara lain pramuka, Paskibraka, bela diri, dance, dan teater komedi kontemporer.', 'ekskul ekstrakurikuler kegiatan siswa pramuka paskibra paskibraka beladiri bela diri dance tari teater komedi organisasi', '2026-11-19 08:26:05'),
	(4, 5, 'Ekstrakurikuler SMK Negeri 6 Malang', 'Ekstrakurikuler di SMK Negeri 6 Malang antara lain Paskibraka, Pramuka, Polisi Taruna, Ecosmart, Pecinta Alam, Badan Dakwah Islam, futsal, dan basket.', 'ekskul ekstrakurikuler kegiatan siswa paskibra paskibraka pramuka polisi taruna ecosmart pecinta alam badan dakwah islam rohis futsal basket organisasi', '2026-11-19 08:26:05');

-- Dumping structure for table chatbot_sekolah.school_address_contacts
CREATE TABLE IF NOT EXISTS `school_address_contacts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int unsigned NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `keywords` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_address_contact` (`school_id`,`title`),
  CONSTRAINT `fk_address_contact_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table chatbot_sekolah.school_address_contacts: ~11 rows (approximately)
INSERT INTO `school_address_contacts` (`id`, `school_id`, `title`, `content`, `keywords`, `updated_at`) VALUES
	(1, 1, 'Alamat dan lokasi', 'SMK Telkom Malang beralamat di Jl. Danau Ranau No. 01, Sawojajar, Kecamatan Kedungkandang, Kota Malang, Jawa Timur 65139.', 'alamat lokasi dimana letak maps sawojajar danau ranau kedungkandang malang rute', '2026-11-19 08:26:05'),
	(2, 1, 'Kontak dan media sosial', 'Call center SMK Telkom Malang: 0812-2348-8999 (juga bisa lewat WhatsApp). Telepon kantor: 0341-712500. Email: info@smktelkom-mlg.sch.id. Website: smktelkom-mlg.sch.id. Instagram dan TikTok: @smktelkommalang.', 'kontak hubungi telepon telpon wa whatsapp email website instagram tiktok ig call center nomor cs admin', '2026-11-19 08:26:05'),
	(3, 1, 'Jam layanan', 'Jam layanan informasi SMK Telkom Malang adalah Senin sampai Sabtu pukul 06.00 sampai 16.00 WIB. Hari Minggu tutup.', 'jam buka tutup layanan operasional kantor hari senin sabtu minggu waktu kapan', '2026-11-19 08:26:05'),
	(4, 2, 'Alamat SMK Negeri 3 Malang', 'SMK Negeri 3 Malang beralamat di Jl. Surabaya No. 1, Gadingkasri, Kecamatan Klojen, Kota Malang, Jawa Timur 65115.', 'alamat lokasi dimana letak maps surabaya gadingkasri klojen malang kode pos rute', '2026-11-19 08:26:05'),
	(5, 2, 'Kontak SMK Negeri 3 Malang', 'Kontak SMK Negeri 3 Malang: telepon (0341) 551734, fax 0341-586395, email smkn3_mlg@yahoo.co.id, website smkn3malang.sch.id.', 'kontak hubungi telepon telpon fax email website nomor cs admin', '2026-11-19 08:26:05'),
	(6, 3, 'Alamat SMK Negeri 4 Malang', 'SMK Negeri 4 Malang beralamat di Jl. Tanimbar No. 22, Kasin, Kecamatan Klojen, Kota Malang, Jawa Timur 65117.', 'alamat lokasi dimana letak maps tanimbar kasin klojen malang kode pos rute', '2026-11-19 08:26:05'),
	(7, 3, 'Kontak SMK Negeri 4 Malang', 'Kontak SMK Negeri 4 Malang: telepon 0341-353798, email mail@smkn4malang.sch.id, website smkn4malang.sch.id.', 'kontak hubungi telepon telpon email website nomor cs admin', '2026-11-19 08:26:05'),
	(8, 4, 'Alamat SMK Negeri 5 Malang', 'SMK Negeri 5 Malang beralamat di Jl. Ikan Piranha Atas (tercatat juga Jl. Ikan Piranha No. 50), Tunjungsekar, Kecamatan Lowokwaru, Kota Malang, Jawa Timur 65142.', 'alamat lokasi dimana letak maps ikan piranha tunjungsekar lowokwaru malang kode pos rute', '2026-11-19 08:26:05'),
	(9, 4, 'Kontak SMK Negeri 5 Malang', 'Kontak SMK Negeri 5 Malang: telepon (0341) 478195, email info@smkn5malang.sch.id, website smkn5malang.sch.id.', 'kontak hubungi telepon telpon email website nomor cs admin', '2026-11-19 08:26:05'),
	(10, 5, 'Alamat SMK Negeri 6 Malang', 'SMK Negeri 6 Malang beralamat di Jl. Ki Ageng Gribig No. 28, Madyopuro, Kecamatan Kedungkandang, Kota Malang, Jawa Timur 65139.', 'alamat lokasi dimana letak maps ki ageng gribig madyopuro kedungkandang malang kode pos rute', '2026-11-19 08:26:05'),
	(11, 5, 'Kontak SMK Negeri 6 Malang', 'Kontak SMK Negeri 6 Malang: telepon (0341) 722216, fax 0341-720138, email info@smkn6malang.sch.id, website smkn6malang.sch.id.', 'kontak hubungi telepon telpon fax email website nomor cs admin', '2026-11-19 08:26:05');

-- Dumping structure for table chatbot_sekolah.school_facilities
CREATE TABLE IF NOT EXISTS `school_facilities` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int unsigned NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `keywords` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_facility` (`school_id`,`title`),
  CONSTRAINT `fk_facility_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table chatbot_sekolah.school_facilities: ~5 rows (approximately)
INSERT INTO `school_facilities` (`id`, `school_id`, `title`, `content`, `keywords`, `updated_at`) VALUES
	(1, 1, 'Fasilitas dan inkubator wirausaha', 'SMK Telkom Malang menyediakan Game Station untuk jurusan Pengembangan Gim. Sekolah juga merancang Malang Techno Park sebagai inkubator kewirausahaan siswa.', 'fasilitas sarana prasarana lab laboratorium game station malang techno park inkubator wirausaha gedung ruang', '2026-11-19 08:26:05'),
	(2, 1, 'Prospek lulusan dan kerja sama industri', 'Lulusan SMK Telkom Malang disiapkan lewat tiga jalur: Bekerja, Meneruskan kuliah, dan Wirausaha (BMW), masing-masing dengan mitra. Pada Januari 2026, Telkom menggandeng perusahaan teknologi global di SMK Telkom Malang untuk memperkuat kurikulum, pelatihan, dan sertifikasi internasional. Sekolah juga bekerja sama dengan pihak seperti Ngalup Collaborative Network dan Jagoan Hosting untuk pelatihan profesi dan wirausaha digital.', 'lulusan alumni prospek karir kerja kuliah wirausaha bmw mitra industri kerjasama sertifikasi sertifikat telkom beasiswa magang prakerin', '2026-11-19 08:26:05'),
	(3, 2, 'Statistik dan fasilitas SMK Negeri 3 Malang', 'Menurut data Kemendikdasmen (semester gasal 2026/2027), SMK Negeri 3 Malang memiliki 64 guru dan 1.581 siswa (384 laki-laki dan 1.197 perempuan) dalam 48 rombongan belajar. Fasilitasnya mencakup 21 ruang kelas, 3 laboratorium, dan 1 perpustakaan di lahan seluas 5.650 meter persegi, dengan akses internet dedicated.', 'jumlah siswa guru murid rombel kelas ruang kelas laboratorium lab perpustakaan fasilitas sarana prasarana luas lahan internet statistik', '2026-11-19 08:26:05'),
	(4, 3, 'Statistik dan fasilitas SMK Negeri 4 Malang', 'Menurut data Kemendikdasmen (semester gasal 2026/2027), SMK Negeri 4 Malang memiliki 101 guru dan 2.550 siswa (1.455 laki-laki dan 1.095 perempuan) dalam 75 rombongan belajar. Fasilitasnya mencakup 49 ruang kelas, 2 laboratorium, dan 1 perpustakaan di lahan seluas 14.000 meter persegi, dengan akses internet dedicated. Pembelajaran berlangsung pagi, lima hari seminggu.', 'jumlah siswa guru murid rombel kelas ruang kelas laboratorium lab perpustakaan fasilitas sarana prasarana luas lahan internet statistik pagi', '2026-11-19 08:26:05'),
	(5, 4, 'Sertifikasi kompetensi (LSP) SMK Negeri 5 Malang', 'SMK Negeri 5 Malang memiliki Lembaga Sertifikasi Profesi (LSP) sendiri untuk uji sertifikasi kompetensi siswa, antara lain pada kompetensi keahlian Kriya Kreatif Keramik, Kriya Kreatif Kayu dan Rotan, dan Teknik Komputer dan Jaringan.', 'lsp sertifikasi sertifikat kompetensi uji bnsp profesi keramik kayu rotan tkj', '2026-11-19 08:26:05');

-- Dumping structure for table chatbot_sekolah.school_majors
CREATE TABLE IF NOT EXISTS `school_majors` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int unsigned NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `keywords` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_major` (`school_id`,`title`),
  CONSTRAINT `fk_major_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table chatbot_sekolah.school_majors: ~10 rows (approximately)
INSERT INTO `school_majors` (`id`, `school_id`, `title`, `content`, `keywords`, `updated_at`) VALUES
	(1, 1, 'Jurusan yang tersedia', 'SMK Telkom Malang memiliki tiga jurusan: Rekayasa Perangkat Lunak (RPL), Teknik Komputer dan Jaringan (TKJ), dan Pengembangan Gim (PG). Sekolah ini awalnya hanya punya satu jurusan Teknologi Informasi, lalu pada 2005 menjadi RPL dan TKJ. Jurusan Pengembangan Gim baru dibuka pada 2024.', 'jurusan konsentrasi keahlian program studi pilihan apa saja rpl tkj pg pengembangan gim game ada berapa', '2026-11-19 08:26:05'),
	(2, 1, 'Jurusan Rekayasa Perangkat Lunak (RPL)', 'Rekayasa Perangkat Lunak (RPL) berfokus pada pembuatan aplikasi dan perangkat lunak. Siswa belajar pemrograman dan pengembangan aplikasi. Lulusan bisa berkarier sebagai programmer atau developer, seperti full stack developer.', 'rpl rekayasa perangkat lunak software programmer pemrograman coding aplikasi developer web mobile ngoding', '2026-11-19 08:26:05'),
	(3, 1, 'Jurusan Teknik Komputer dan Jaringan (TKJ)', 'Teknik Komputer dan Jaringan (TKJ) berfokus pada komputer dan jaringan. Lulusan berpeluang bekerja di bidang infrastruktur jaringan, misalnya sebagai network engineer.', 'tkj teknik komputer jaringan network engineer infrastruktur server internet kabel perakitan', '2026-11-19 08:26:05'),
	(4, 1, 'Jurusan Pengembangan Gim (PG)', 'Pengembangan Gim (PG) adalah jurusan baru yang dibuka pada 2024 untuk siswa yang ingin menjadi kreator game. Siswa belajar proses pembuatan game, mulai dari merancang konsep cerita dan level, membuat aset grafis 2D dan 3D, hingga pemrograman. Sekolah menyiapkan fasilitas Game Station untuk mendukung pembelajaran.', 'pg pengembangan gim game gamedev game developer membuat game grafis 2d 3d level design game station pplg', '2026-11-19 08:26:05'),
	(5, 1, 'Komposisi kelas per jurusan dan kuota', 'Pada penerimaan siswa baru tahun ajaran 2025/2026, SMK Telkom Malang merencanakan 14 kelas, yaitu 8 kelas RPL, 4 kelas TKJ, dan 2 kelas PG. Jurusan RPL memiliki kelas paling banyak.', 'kuota daya tampung jumlah kelas per jurusan rpl tkj pg komposisi peminat favorit', '2026-11-19 08:26:05'),
	(6, 1, 'Pemetaan minat dan bakat (Entry Level Assessment)', 'SMK Telkom Malang menggelar Entry Level Assessment (ELA) bersama GuruInovatif.id pada 13 Juli 2026, diikuti 470 peserta didik. Asesmen ini memetakan potensi siswa dan kecocokannya dengan bidang kejuruan. Hasilnya dipakai sekolah sebagai dasar pengambilan keputusan.', 'ela entry level assessment tes minat bakat pemetaan potensi cocok jurusan memilih guruinovatif', '2026-11-19 08:26:05'),
	(7, 2, 'Jurusan di SMK Negeri 3 Malang', 'SMK Negeri 3 Malang memiliki kompetensi keahlian di bidang tata boga (kuliner), tata busana (busana, desain fesyen, desain dan produksi busana), tata kecantikan kulit dan rambut (kecantikan dan spa), perhotelan (akomodasi perhotelan), serta Teknik Komputer dan Jaringan (TKJ, juga disebut Teknik Jaringan Komputer dan Telekomunikasi). Nama kompetensi mengikuti Kurikulum Merdeka sehingga bisa berbeda dari penyebutan lama.', 'jurusan program keahlian kompetensi tata boga kuliner busana fesyen kecantikan spa perhotelan akomodasi tkj teknik komputer jaringan tjkt telekomunikasi memasak tata rias hotel', '2026-11-19 08:26:05'),
	(8, 3, 'Jurusan di SMK Negeri 4 Malang', 'SMK Negeri 4 Malang memiliki banyak kompetensi keahlian, antara lain Desain Grafika, Produksi Grafika (Teknik Grafika), Multimedia, Animasi, Desain Komunikasi Visual (DKV), Rekayasa Perangkat Lunak (RPL), Pengembangan Perangkat Lunak dan Gim, Teknik Komputer dan Jaringan (TKJ, juga disebut Teknik Jaringan Komputer dan Telekomunikasi), Teknik Mekatronika, Teknik Elektronika, Teknik Logistik, dan Perhotelan.', 'jurusan program keahlian kompetensi grafika percetakan multimedia animasi dkv desain komunikasi visual rpl pplg gim game tkj tjkt mekatronika elektronika logistik perhotelan software coding', '2026-11-19 08:26:05'),
	(9, 4, 'Jurusan di SMK Negeri 5 Malang', 'SMK Negeri 5 Malang memiliki kompetensi keahlian di bidang kriya dan busana serta teknologi informasi: Desain dan Produksi Kriya (Kriya Kreatif Batik dan Tekstil, Kriya Kreatif Keramik, dan Kriya Kreatif Kayu dan Rotan), Busana (Desain dan Produksi Busana), Animasi, Desain Komunikasi Visual (DKV), Multimedia, Pengembangan Perangkat Lunak dan Gim, Rekayasa Perangkat Lunak (RPL), serta Teknik Komputer dan Jaringan (TKJ, juga disebut Teknik Jaringan Komputer dan Telekomunikasi).', 'jurusan program keahlian kompetensi kriya batik tekstil keramik kayu rotan busana butik tata busana animasi dkv desain komunikasi visual multimedia rpl pplg gim game tkj tjkt software coding', '2026-11-19 08:26:05'),
	(10, 5, 'Jurusan di SMK Negeri 6 Malang', 'SMK Negeri 6 Malang memiliki kompetensi keahlian bidang teknik dan teknologi informasi: Teknik Instalasi Tenaga Listrik (Teknik Ketenagalistrikan), Teknik Pemesinan (Teknik Mesin), Teknik Kendaraan Ringan Otomotif (Teknik Otomotif), Teknik Ototronik, Teknik Alat Berat, Desain Pemodelan dan Informasi Bangunan (DPIB), Konstruksi Jalan, Irigasi dan Jembatan (Konstruksi dan Perawatan Bangunan Sipil), Rekayasa Perangkat Lunak (RPL), Teknik Komputer dan Jaringan (TKJ), dan Sistem Informatika, Jaringan dan Aplikasi (SIJA).', 'jurusan program keahlian kompetensi teknik listrik titl pemesinan mesin tkr otomotif otomotif ototronik alat berat dpib bangunan gambar konstruksi jalan irigasi jembatan sipil rpl pplg tkj tjkt sija software coding las bubut', '2026-11-19 08:26:05');

-- Dumping structure for table chatbot_sekolah.school_ppdb
CREATE TABLE IF NOT EXISTS `school_ppdb` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int unsigned NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `keywords` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ppdb` (`school_id`,`title`),
  CONSTRAINT `fk_ppdb_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table chatbot_sekolah.school_ppdb: ~7 rows (approximately)
INSERT INTO `school_ppdb` (`id`, `school_id`, `title`, `content`, `keywords`, `updated_at`) VALUES
	(1, 1, 'Informasi pendaftaran siswa baru (PPDB)', 'Pendaftaran siswa baru SMK Telkom Malang dilakukan secara online lewat situs PPDB sekolah di ppdb.smktelkom-mlg.sch.id. Jadwal dan ketentuan tahun berjalan diumumkan di situs tersebut. Untuk menanyakan langsung, hubungi call center sekolah di 0812-2348-8999. Pada penerimaan 2025/2026, sekolah membuka pendaftaran awal bagi siswa kelas 8 lewat program Moklet Pass Priority Programme (MP3) yang diluncurkan 6 Juni 2024.', 'ppdb pendaftaran daftar siswa baru penerimaan spmb cara mendaftar jadwal gelombang online website mp3 moklet pass registrasi', '2026-11-19 08:26:05'),
	(2, 1, 'Tahapan seleksi masuk', 'Pada pelaksanaan PPDB sebelumnya, seleksi terdiri dari tes akademik (Bahasa Inggris dan Matematika) serta tes non-akademik berupa wawancara siswa, wawancara orang tua, dan tes kesamaptaan (kebugaran). Ketentuan tahun berjalan dapat berbeda, jadi cek situs PPDB sekolah.', 'seleksi tes ujian masuk syarat wawancara kesamaptaan akademik matematika bahasa inggris jalur persyaratan', '2026-11-19 08:26:05'),
	(3, 1, 'Biaya pendaftaran dan biaya sekolah', 'Rincian biaya pendaftaran, uang masuk, dan SPP belum tersedia di data kami. Informasi biaya yang resmi dapat dilihat di situs PPDB sekolah (ppdb.smktelkom-mlg.sch.id) atau ditanyakan langsung ke call center sekolah di 0812-2348-8999.', 'biaya spp uang masuk uang gedung bayar mahal murah tarif harga pendaftaran beasiswa cicilan administrasi', '2026-11-19 08:26:05'),
	(4, 2, 'Informasi pendaftaran SMK Negeri 3 Malang', 'Informasi pendaftaran siswa baru (jadwal, syarat, dan jalur) SMK Negeri 3 Malang untuk tahun berjalan diumumkan lewat situs resmi sekolah smkn3malang.sch.id dan Dinas Pendidikan Provinsi Jawa Timur. Calon siswa juga bisa bertanya langsung lewat telepon sekolah (0341) 551734. Rincian biaya dan jadwal tahun berjalan tidak tersedia di data kami.', 'ppdb spmb pendaftaran daftar siswa baru penerimaan cara mendaftar jadwal syarat jalur seleksi registrasi masuk biaya spp uang masuk gratis negeri', '2026-11-19 08:26:05'),
	(5, 3, 'Informasi pendaftaran SMK Negeri 4 Malang', 'Informasi pendaftaran siswa baru (jadwal, syarat, dan jalur) SMK Negeri 4 Malang untuk tahun berjalan diumumkan lewat situs resmi sekolah smkn4malang.sch.id dan Dinas Pendidikan Provinsi Jawa Timur. Calon siswa juga bisa bertanya lewat telepon sekolah 0341-353798. Rincian biaya dan jadwal tahun berjalan tidak tersedia di data kami.', 'ppdb spmb pendaftaran daftar siswa baru penerimaan cara mendaftar jadwal syarat jalur seleksi registrasi masuk biaya spp uang masuk gratis negeri', '2026-11-19 08:26:05'),
	(6, 4, 'Informasi pendaftaran SMK Negeri 5 Malang', 'Informasi pendaftaran siswa baru (jadwal, syarat, dan jalur) SMK Negeri 5 Malang untuk tahun berjalan diumumkan lewat situs resmi sekolah smkn5malang.sch.id (ada halaman PPDB) dan Dinas Pendidikan Provinsi Jawa Timur. Calon siswa juga bisa bertanya lewat telepon sekolah (0341) 478195. Rincian biaya dan jadwal tahun berjalan tidak tersedia di data kami.', 'ppdb spmb pendaftaran daftar siswa baru penerimaan cara mendaftar jadwal syarat jalur seleksi registrasi masuk biaya spp uang masuk gratis negeri', '2026-11-19 08:26:05'),
	(7, 5, 'Informasi pendaftaran SMK Negeri 6 Malang', 'Informasi pendaftaran siswa baru (jadwal, syarat, dan jalur) SMK Negeri 6 Malang untuk tahun berjalan diumumkan lewat situs resmi sekolah smkn6malang.sch.id dan Dinas Pendidikan Provinsi Jawa Timur. Calon siswa juga bisa bertanya lewat telepon sekolah (0341) 722216. Rincian biaya dan jadwal tahun berjalan tidak tersedia di data kami.', 'ppdb spmb pendaftaran daftar siswa baru penerimaan cara mendaftar jadwal syarat jalur seleksi registrasi masuk biaya spp uang masuk gratis negeri', '2026-11-19 08:26:05');

-- Dumping structure for table chatbot_sekolah.school_profiles
CREATE TABLE IF NOT EXISTS `school_profiles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `school_id` int unsigned NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `keywords` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_profile` (`school_id`,`title`),
  CONSTRAINT `fk_profile_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table chatbot_sekolah.school_profiles: ~12 rows (approximately)
INSERT INTO `school_profiles` (`id`, `school_id`, `title`, `content`, `keywords`, `updated_at`) VALUES
	(1, 1, 'Profil singkat SMK Telkom Malang', 'SMK Telkom Malang adalah sekolah menengah kejuruan swasta di bawah naungan Yayasan Pendidikan Telkom (YPT) yang berfokus pada bidang teknologi informasi. Sekolah ini berdiri pada 14 Juni 1992 dan dikenal sebagai pelopor SMK informatika di Indonesia. Nama resminya dulu SMK Telkom Sandhy Putra Malang, lalu menjadi SMK Telkom Malang setelah rebranding sekolah-sekolah Telkom pada 2014. Siswanya dijuluki Mokleters, dari kata Moklet yang merupakan kebalikan dari Telkom.', 'profil sekolah tentang sejarah berdiri didirikan 1992 moklet mokleters sandhy putra yayasan ypt telkom swasta apa itu', '2026-11-19 08:26:05'),
	(2, 1, 'Akreditasi, standar mutu, dan kurikulum', 'SMK Telkom Malang terakreditasi A, memiliki standar mutu ISO 9001:2015, dan berstatus sekolah Adiwiyata (sekolah peduli lingkungan). Kurikulum yang dipakai adalah Kurikulum Merdeka.', 'akreditasi a iso 9001 mutu adiwiyata kurikulum merdeka sertifikasi kualitas bagus terbaik', '2026-11-19 08:26:05'),
	(3, 1, 'Kepala sekolah', 'Kepala SMK Telkom Malang adalah Rahmat Dwi Djatmiko.', 'kepala sekolah kasek kepsek pimpinan siapa rahmat djatmiko jatmiko', '2026-11-19 08:26:05'),
	(4, 1, 'Jumlah siswa dan kelas', 'SMK Telkom Malang memiliki lebih dari 1.400 siswa dari kelas X, XI, dan XII. Sekolah menyediakan sekitar 14 kelas untuk setiap angkatan.', 'jumlah siswa murid berapa kelas angkatan rombel besar', '2026-11-19 08:26:05'),
	(5, 2, 'Profil singkat SMK Negeri 3 Malang', 'SMK Negeri 3 Malang adalah sekolah menengah kejuruan negeri di Kota Malang dengan akreditasi A (NPSN 20533815). Sekolah ini berdiri pada 1977, memakai Kurikulum SMK Merdeka, dan menyelenggarakan pembelajaran sehari penuh lima hari seminggu. Sekolah dibina oleh Cabang Dinas Pendidikan Wilayah Kota Malang dan Kota Batu.', 'profil sekolah tentang sejarah berdiri 1977 negeri akreditasi a npsn kurikulum merdeka sehari penuh lima hari cabang dinas', '2026-11-19 08:26:05'),
	(6, 2, 'Kepala SMK Negeri 3 Malang', 'Kepala SMK Negeri 3 Malang adalah Vivi Afianty, S.Pd., MM.', 'kepala sekolah kasek kepsek pimpinan siapa vivi afianty', '2026-11-19 08:26:05'),
	(7, 3, 'Profil singkat SMK Negeri 4 Malang', 'SMK Negeri 4 Malang berdiri pada 26 Mei 1979 dan terakreditasi A (NPSN 20533816). Sekolah ini dikenal sebagai sekolah grafika (teknik percetakan) pertama di Malang, memiliki sistem manajemen mutu ISO 9001 sejak 2008, dan memakai Kurikulum SMK Merdeka. Bidang keahlian Animasi mulai dibuka pada 2006.', 'profil sekolah tentang sejarah berdiri 1979 grafika percetakan negeri akreditasi a npsn iso 9001 mutu kurikulum merdeka animasi', '2026-11-19 08:26:05'),
	(8, 3, 'Kepala SMK Negeri 4 Malang', 'Kepala SMK Negeri 4 Malang adalah Drs. Gunawan Dwiyono, S.ST., M.Pd.', 'kepala sekolah kasek kepsek pimpinan siapa gunawan dwiyono', '2026-11-19 08:26:05'),
	(9, 4, 'Profil singkat SMK Negeri 5 Malang', 'SMK Negeri 5 Malang berdiri pada 1998 di atas lahan sekitar 13.816 meter persegi dan terakreditasi A (NPSN 20533817). Mottonya Cerdas, Terampil, Kompetitif. Sekolah memakai Kurikulum Merdeka dan metode pembelajaran Competency Based Training serta Production Based Training. Visinya mewujudkan lulusan unggul, kompeten, berdaya saing, berbasis keunggulan lokal, berbudaya lingkungan, dan berwawasan global.', 'profil sekolah tentang sejarah berdiri 1998 negeri akreditasi a npsn motto cerdas terampil kompetitif visi kurikulum merdeka lahan', '2026-11-19 08:26:05'),
	(10, 4, 'Kepala SMK Negeri 5 Malang', 'Kepala SMK Negeri 5 Malang adalah Budi Purwanto, S.Pd., M.M.', 'kepala sekolah kasek kepsek pimpinan siapa budi purwanto', '2026-11-19 08:26:05'),
	(11, 5, 'Profil singkat SMK Negeri 6 Malang', 'SMK Negeri 6 Malang adalah SMK negeri berbasis teknologi dan rekayasa (teknik) di Kota Malang, terakreditasi A (NPSN 20533818). Sekolah berdiri pada 2002 (SK Direktur Dikmenjur tertanggal 5 Agustus 2002) setelah STM Negeri Malang pindah ke Singosari sehingga Kota Malang membutuhkan SMK teknik. Sekolah memakai Kurikulum Merdeka dengan pembelajaran sehari penuh lima hari seminggu.', 'profil sekolah tentang sejarah berdiri 2002 negeri teknik teknologi rekayasa akreditasi a npsn kurikulum merdeka sehari penuh stm', '2026-11-19 08:26:05'),
	(12, 5, 'Kepala SMK Negeri 6 Malang', 'Kepala SMK Negeri 6 Malang adalah Mohammad Taufik (menurut data per pertengahan 2026).', 'kepala sekolah kasek kepsek pimpinan siapa mohammad taufik', '2026-11-19 08:26:05');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
