/**
 * Central translation catalog.
 * All UI strings live here — adding a new language means adding one field per entry.
 *
 * Usage:
 *   const { tk } = useLang();
 *   tk('nav.home')  // → 'Home' | 'Accueil' | 'الرئيسية'
 */

export type Lang = "ar" | "fr" | "en";

export interface TranslationEntry {
  ar: string;
  fr: string;
  en: string;
}

export const translations = {
  // ── App ────────────────────────────────────────────────────────────────────
  "app.name":    { ar: "منصة جعدي",                        fr: "Mounassata Djadi",                          en: "Djadi Platform" },
  "app.tagline": { ar: "رفيقك الذكي نحو البكالوريا",       fr: "Votre compagnon intelligent vers le Bac",   en: "Your smart companion to the Baccalaureate" },

  // ── Common ─────────────────────────────────────────────────────────────────
  "common.home":          { ar: "الرئيسية",         fr: "Accueil",           en: "Home" },
  "common.back":          { ar: "رجوع",              fr: "Retour",            en: "Back" },
  "common.save":          { ar: "حفظ",               fr: "Enregistrer",       en: "Save" },
  "common.cancel":        { ar: "إلغاء",             fr: "Annuler",           en: "Cancel" },
  "common.delete":        { ar: "حذف",               fr: "Supprimer",         en: "Delete" },
  "common.edit":          { ar: "تعديل",             fr: "Modifier",          en: "Edit" },
  "common.add":           { ar: "إضافة",             fr: "Ajouter",           en: "Add" },
  "common.search":        { ar: "بحث",               fr: "Rechercher",        en: "Search" },
  "common.loading":       { ar: "جاري التحميل...",   fr: "Chargement...",     en: "Loading..." },
  "common.error":         { ar: "حدث خطأ",           fr: "Une erreur est survenue", en: "An error occurred" },
  "common.retry":         { ar: "إعادة المحاولة",    fr: "Réessayer",         en: "Retry" },
  "common.logout":        { ar: "تسجيل الخروج",      fr: "Se déconnecter",    en: "Sign out" },
  "common.settings":      { ar: "الإعدادات",         fr: "Paramètres",        en: "Settings" },
  "common.notifications": { ar: "الإشعارات",         fr: "Notifications",     en: "Notifications" },
  "common.favorites":     { ar: "المفضلة",           fr: "Favoris",           en: "Favorites" },
  "common.subjects":      { ar: "المواد",             fr: "Matières",          en: "Subjects" },
  "common.lessons":       { ar: "الدروس",             fr: "Cours",             en: "Lessons" },
  "common.baccalaureate": { ar: "البكالوريا",         fr: "Baccalauréat",      en: "Baccalaureate" },
  "common.calculator":    { ar: "حساب المعدل",        fr: "Moyenne",           en: "GPA Calc" },
  "common.sciCalc":       { ar: "الآلة الحاسبة العلمية", fr: "Calculatrice scientifique", en: "Scientific Calc" },
  "common.sciCalcShort":  { ar: "الآلة الحاسبة",      fr: "Calculatrice",      en: "Calculator" },
  "common.reviewChannels":{ ar: "قنوات المراجعة",     fr: "Révision",          en: "Review" },
  "common.noData":        { ar: "لا توجد بيانات",     fr: "Aucune donnée",     en: "No data" },
  "common.noResults":     { ar: "لا توجد نتائج",      fr: "Aucun résultat",    en: "No results" },
  "common.confirm":       { ar: "تأكيد",              fr: "Confirmer",         en: "Confirm" },
  "common.close":         { ar: "إغلاق",              fr: "Fermer",            en: "Close" },
  "common.open":          { ar: "فتح",                fr: "Ouvrir",            en: "Open" },
  "common.download":      { ar: "تحميل",              fr: "Télécharger",       en: "Download" },
  "common.new":           { ar: "جديد",               fr: "Nouveau",           en: "New" },
  "common.view":          { ar: "عرض",                fr: "Voir",              en: "View" },
  "common.semester1":     { ar: "الفصل الأول",        fr: "1er Trimestre",     en: "Semester 1" },
  "common.semester2":     { ar: "الفصل الثاني",       fr: "2ème Trimestre",    en: "Semester 2" },
  "common.semester3":     { ar: "الفصل الثالث",       fr: "3ème Trimestre",    en: "Semester 3" },
  "common.video":         { ar: "فيديو",              fr: "Vidéo",             en: "Video" },
  "common.document":      { ar: "مستند",              fr: "Document",          en: "Document" },
  "common.minutes":       { ar: "دقيقة",              fr: "min",               en: "min" },
  "common.item":          { ar: "عنصر",               fr: "Élément",           en: "Item" },
  "common.notAvailable":  { ar: "غير متاح",           fr: "Non disponible",    en: "Not available" },

  // ── Navigation ─────────────────────────────────────────────────────────────
  "nav.home":             { ar: "الرئيسية",            fr: "Accueil",           en: "Home" },
  "nav.subjects":         { ar: "المواد",              fr: "Matières",          en: "Subjects" },
  "nav.baccalaureate":    { ar: "البكالوريا",          fr: "Baccalauréat",      en: "Baccalaureate" },
  "nav.favorites":        { ar: "المفضلة",             fr: "Favoris",           en: "Favorites" },
  "nav.calculator":       { ar: "حساب المعدل",         fr: "Moyenne",           en: "GPA Calc" },
  "nav.sciCalc":          { ar: "الآلة الحاسبة العلمية", fr: "Calculatrice",   en: "Sci. Calc" },
  "nav.sciCalcShort":     { ar: "الآلة الحاسبة",       fr: "Calculatrice",      en: "Calculator" },
  "nav.reviewChannels":   { ar: "قنوات المراجعة",      fr: "Révision",          en: "Review" },
  "nav.settings":         { ar: "الإعدادات",           fr: "Paramètres",        en: "Settings" },
  "nav.notifications":    { ar: "الإشعارات",           fr: "Notifications",     en: "Notifications" },

  // ── Auth ───────────────────────────────────────────────────────────────────
  "auth.login":            { ar: "تسجيل الدخول",          fr: "Connexion",                   en: "Sign In" },
  "auth.loginWelcome":     { ar: "مرحباً بعودتك!",         fr: "Bon retour !",                en: "Welcome back!" },
  "auth.loginSubtitle":    { ar: "سجل دخولك لمتابعة دروسك", fr: "Connectez-vous pour continuer", en: "Sign in to continue your lessons" },
  "auth.register":         { ar: "إنشاء حساب جديد",        fr: "Créer un compte",             en: "Create Account" },
  "auth.registerSlogan":   { ar: "خطوتك الأولى للنجاح",    fr: "Votre premier pas vers le succès", en: "Your first step to success" },
  "auth.registerSubtitle": { ar: "انضم للآلاف من الطلاب المتفوقين", fr: "Rejoignez des milliers d'étudiants", en: "Join thousands of top students" },
  "auth.registerStart":    { ar: "ابدأ رحلتك التعليمية معنا اليوم", fr: "Commencez votre parcours éducatif", en: "Start your learning journey today" },
  "auth.email":            { ar: "البريد الإلكتروني",       fr: "Email",                       en: "Email" },
  "auth.emailPlaceholder": { ar: "name@example.com",         fr: "nom@exemple.com",             en: "name@example.com" },
  "auth.password":         { ar: "كلمة المرور",             fr: "Mot de passe",                en: "Password" },
  "auth.fullName":         { ar: "الاسم الكامل",            fr: "Nom complet",                 en: "Full Name" },
  "auth.noAccount":        { ar: "ليس لديك حساب؟",          fr: "Pas encore de compte ?",      en: "Don't have an account?" },
  "auth.createAccount":    { ar: "أنشئ حساباً جديداً",      fr: "Créer un compte",             en: "Create a new account" },
  "auth.hasAccount":       { ar: "لديك حساب بالفعل؟",       fr: "Vous avez déjà un compte ?",  en: "Already have an account?" },
  "auth.signIn":           { ar: "سجل دخولك",              fr: "Se connecter",                en: "Sign in" },
  "auth.invalidEmail":     { ar: "البريد الإلكتروني غير صالح", fr: "Email invalide",           en: "Invalid email address" },
  "auth.passwordMin":      { ar: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", fr: "Le mot de passe doit comporter au moins 6 caractères", en: "Password must be at least 6 characters" },
  "auth.serverError":      { ar: "تعذّر الاتصال بالسيرفر",   fr: "Impossible de contacter le serveur", en: "Unable to connect to server" },
  "auth.loginError":       { ar: "خطأ في تسجيل الدخول",     fr: "Erreur de connexion",         en: "Sign in error" },
  "auth.invalidCredentials": { ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة", fr: "Email ou mot de passe incorrect", en: "Invalid email or password" },
  "auth.namePlaceholder":  { ar: "الاسم الكامل",             fr: "Votre nom complet",           en: "Your full name" },

  // ── Onboarding ─────────────────────────────────────────────────────────────
  "onboarding.chooseGrade":    { ar: "اختر مستواك الدراسي",   fr: "Choisissez votre niveau", en: "Choose your study level" },
  "onboarding.chooseBranch":   { ar: "اختر شعبتك",            fr: "Choisissez votre filière", en: "Choose your branch" },
  "onboarding.chooseLanguage": { ar: "اختر لغتك المفضلة",     fr: "Choisissez votre langue", en: "Choose your language" },
  "onboarding.continue":       { ar: "متابعة",                fr: "Continuer",               en: "Continue" },
  "onboarding.grade1":         { ar: "السنة الأولى ثانوي",    fr: "1ère Secondaire",         en: "1st Secondary" },
  "onboarding.grade2":         { ar: "السنة الثانية ثانوي",   fr: "2ème Secondaire",         en: "2nd Secondary" },
  "onboarding.grade3":         { ar: "السنة الثالثة ثانوي",   fr: "3ème Secondaire",         en: "3rd Secondary" },

  // ── Dashboard ──────────────────────────────────────────────────────────────
  "dashboard.title":            { ar: "لوحة المتابعة",          fr: "Tableau de bord",    en: "Dashboard" },
  "dashboard.greeting.morning": { ar: "صباح الخير",             fr: "Bonjour",            en: "Good morning" },
  "dashboard.greeting.afternoon":{ ar: "مساء الخير",            fr: "Bon après-midi",     en: "Good afternoon" },
  "dashboard.greeting.evening": { ar: "مساء النور",             fr: "Bonsoir",            en: "Good evening" },
  "dashboard.greeting.night":   { ar: "تصبح على خير",           fr: "Bonne nuit",         en: "Good night" },
  "dashboard.mySubjects":       { ar: "موادي الدراسية",          fr: "Mes matières",       en: "My Subjects" },
  "dashboard.quickAccess":      { ar: "وصول سريع",              fr: "Accès rapide",       en: "Quick Access" },

  // ── Subjects ───────────────────────────────────────────────────────────────
  "subjects.title":    { ar: "المواد الدراسية",  fr: "Matières scolaires", en: "School Subjects" },
  "subjects.subtitle": { ar: "اختر المادة للبدء", fr: "Choisissez une matière", en: "Choose a subject to start" },

  // ── Subject Detail ─────────────────────────────────────────────────────────
  "subjectDetail.notFound":     { ar: "المادة غير موجودة",            fr: "Matière introuvable",           en: "Subject not found" },
  "subjectDetail.lessons":      { ar: "الدروس",                       fr: "Cours",                         en: "Lessons" },
  "subjectDetail.exams":        { ar: "الفروض",                       fr: "Épreuves",                      en: "Exams" },
  "subjectDetail.tests":        { ar: "الاختبارات",                   fr: "Tests",                         en: "Tests" },
  "subjectDetail.homework":     { ar: "الواجبات المنزلية",            fr: "Devoirs",                       en: "Homework" },
  "subjectDetail.explore":      { ar: "استكشف دروس وتدريبات هذه المادة", fr: "Explorez les cours de cette matière", en: "Explore lessons for this subject" },
  "subjectDetail.lessonCount":  { ar: "عدد الدروس",                   fr: "Cours",                         en: "Lessons" },
  "subjectDetail.pastBac":      { ar: "بكالوريات سابقة",              fr: "Baccalauréats passés",          en: "Past Baccalaureate" },
  "subjectDetail.pastBacDesc":  { ar: "امتحانات بكالوريا من 2008 إلى 2026", fr: "Examens bac de 2008 à 2026", en: "Bac exams 2008–2026" },
  "subjectDetail.noLessons":    { ar: "لا توجد دروس حالياً في هذه المادة", fr: "Aucun cours disponible", en: "No lessons available" },
  "subjectDetail.noExams":      { ar: "لا توجد فروض حالياً لهذه المادة", fr: "Aucune épreuve disponible", en: "No exams available" },
  "subjectDetail.noTests":      { ar: "لا توجد اختبارات حالياً",      fr: "Aucun test disponible",        en: "No tests available" },
  "subjectDetail.noHomework":   { ar: "لا توجد واجبات منزلية حالياً", fr: "Aucun devoir disponible",      en: "No homework available" },

  // ── Lessons ────────────────────────────────────────────────────────────────
  "lessons.title":        { ar: "مكتبة الدروس",                     fr: "Bibliothèque de cours",          en: "Lessons Library" },
  "lessons.subtitle":     { ar: "ابحث وتصفح جميع الدروس المتاحة",   fr: "Parcourez tous les cours",       en: "Browse all available lessons" },
  "lessons.notAvailable": { ar: "المحتوى غير متاح حالياً",          fr: "Contenu non disponible",         en: "Content not available" },
  "lessons.notFound":     { ar: "الدرس غير موجود",                   fr: "Cours introuvable",              en: "Lesson not found" },
  "lessons.description":  { ar: "وصف الدرس",                        fr: "Description du cours",           en: "Lesson Description" },
  "lessons.completed":    { ar: "هل أتممت الدرس؟",                   fr: "Avez-vous terminé ce cours ?",   en: "Did you complete this lesson?" },

  // ── Baccalaureate ──────────────────────────────────────────────────────────
  "bac.title":      { ar: "البكالوريات السابقة",                    fr: "Baccalauréats précédents",     en: "Past Baccalaureates" },
  "bac.subtitle":   { ar: "اختر السنة والشعبة والمادة لفتح الامتحان", fr: "Choisissez l'année et la matière", en: "Choose year, branch and subject" },
  "bac.chooseYear": { ar: "اختر السنة",                             fr: "Choisir l'année",              en: "Choose year" },
  "bac.exam":       { ar: "الامتحان",                               fr: "Examen",                       en: "Exam" },
  "bac.noExams":    { ar: "لا توجد امتحانات متاحة",                  fr: "Aucun examen disponible",      en: "No exams available" },

  // ── Notifications ──────────────────────────────────────────────────────────
  "notifications.title":    { ar: "الإشعارات",         fr: "Notifications",     en: "Notifications" },
  "notifications.empty":    { ar: "لا توجد إشعارات",   fr: "Aucune notification", en: "No notifications" },
  "notifications.new":      { ar: "جديد",              fr: "Nouveau",           en: "New" },
  "notifications.markRead": { ar: "تعليم كمقروء",      fr: "Marquer comme lu",  en: "Mark as read" },
  "notifications.markAll":  { ar: "تعليم الكل كمقروء", fr: "Tout marquer",      en: "Mark all as read" },

  // ── Favorites ──────────────────────────────────────────────────────────────
  "favorites.title":        { ar: "المفضلة",                          fr: "Favoris",                         en: "Favorites" },
  "favorites.myLessons":    { ar: "دروسي",                            fr: "Mes cours",                       en: "My Lessons" },
  "favorites.myExams":      { ar: "فروضي",                            fr: "Mes épreuves",                    en: "My Exams" },
  "favorites.myTests":      { ar: "اختباراتي",                        fr: "Mes tests",                       en: "My Tests" },
  "favorites.myHomework":   { ar: "واجباتي المنزلية",                  fr: "Mes devoirs",                     en: "My Homework" },
  "favorites.addFav":       { ar: "إضافة للمفضلة",                    fr: "Ajouter aux favoris",             en: "Add to favorites" },
  "favorites.removeFav":    { ar: "إزالة من المفضلة",                  fr: "Retirer des favoris",             en: "Remove from favorites" },
  "favorites.reorderHint":  { ar: "استخدم الأسهم لإعادة الترتيب",     fr: "Utilisez les flèches pour réorganiser", en: "Use arrows to reorder" },
  "favorites.moveUp":       { ar: "نقل للأعلى",                       fr: "Déplacer vers le haut",           en: "Move up" },
  "favorites.moveDown":     { ar: "نقل للأسفل",                       fr: "Déplacer vers le bas",            en: "Move down" },
  "favorites.deleteError":  { ar: "فشل الحذف",                        fr: "Échec de la suppression",         en: "Delete failed" },
  "favorites.reorderError": { ar: "فشل إعادة الترتيب",                fr: "Échec du réordonnancement",       en: "Reorder failed" },
  "favorites.emptyHint":    { ar: "اضغط على ❤️ بجانب أي عنصر لحفظه", fr: "Appuyez sur ❤️ pour enregistrer", en: "Tap ❤️ next to any item to save it" },

  // ── Settings ───────────────────────────────────────────────────────────────
  "settings.title":         { ar: "الإعدادات",           fr: "Paramètres",                      en: "Settings" },
  "settings.language":      { ar: "اللغة",               fr: "Langue",                          en: "Language" },
  "settings.theme":         { ar: "المظهر",              fr: "Apparence",                       en: "Appearance" },
  "settings.light":         { ar: "فاتح",                fr: "Clair",                           en: "Light" },
  "settings.dark":          { ar: "داكن",                fr: "Sombre",                          en: "Dark" },
  "settings.notifEnabled":  { ar: "مفعّلة",              fr: "Activées",                        en: "Enabled" },
  "settings.notifDisabled": { ar: "معطّلة",              fr: "Désactivées",                     en: "Disabled" },
  "settings.myFavorites":   { ar: "محفوظاتي",            fr: "Mes favoris",                     en: "My Favorites" },
  "settings.study":         { ar: "الدراسة",             fr: "Études",                          en: "Study" },
  "settings.changeLevel":   { ar: "إعادة اختيار المستوى الدراسي", fr: "Changer de niveau",       en: "Change Study Level" },
  "settings.about":         { ar: "عن التطبيق",           fr: "À propos",                        en: "About" },
  "settings.aboutApp":      { ar: "نبذة عن التطبيق",     fr: "À propos de l'application",       en: "About the App" },
  "settings.privacy":       { ar: "سياسة الخصوصية",      fr: "Politique de confidentialité",    en: "Privacy Policy" },
  "settings.signOut":       { ar: "تسجيل الخروج",        fr: "Se déconnecter",                  en: "Sign out" },
  "settings.version":       { ar: "منصة جعدي · الإصدار 1.0.0", fr: "Mounassata Djadi · v1.0.0", en: "Djadi Platform · v1.0.0" },
  "settings.terms":         { ar: "شروط الاستخدام",      fr: "Conditions d'utilisation",        en: "Terms of Use" },

  // ── Review Channels ────────────────────────────────────────────────────────
  "reviewChannels.title": { ar: "قنوات المراجعة", fr: "Chaînes de révision", en: "Review Channels" },
  "reviewChannels.empty": { ar: "لا توجد قنوات متاحة", fr: "Aucune chaîne disponible", en: "No channels available" },
  "reviewChannels.watch": { ar: "مشاهدة", fr: "Regarder", en: "Watch" },

  // ── About ──────────────────────────────────────────────────────────────────
  "about.title":        { ar: "نبذة عن التطبيق", fr: "À propos de l'application", en: "About the App" },
  "about.followUs":     { ar: "تابعنا على",       fr: "Suivez-nous sur",           en: "Follow us on" },
  "about.notAvailable": { ar: "غير متاح",         fr: "Non disponible",            en: "Not available" },

  // ── Not Found ──────────────────────────────────────────────────────────────
  "notFound.title":    { ar: "الصفحة غير موجودة",               fr: "Page introuvable",              en: "Page Not Found" },
  "notFound.subtitle": { ar: "عذراً، لا يمكن العثور على هذه الصفحة", fr: "Désolé, cette page est introuvable", en: "Sorry, this page could not be found" },
  "notFound.goHome":   { ar: "العودة للرئيسية",                  fr: "Retour à l'accueil",            en: "Go to Home" },

  // ── Grade Calculator ───────────────────────────────────────────────────────
  "calc.title":       { ar: "حساب المعدل",     fr: "Calcul de la moyenne",  en: "GPA Calculator" },
  "calc.average":     { ar: "المعدل",          fr: "Moyenne",               en: "Average" },
  "calc.coefficient": { ar: "المعامل",         fr: "Coefficient",           en: "Coefficient" },
  "calc.grade":       { ar: "العلامة",         fr: "Note",                  en: "Grade" },
  "calc.reset":       { ar: "إعادة تعيين",     fr: "Réinitialiser",         en: "Reset" },
  "calc.calculate":   { ar: "احسب المعدل",     fr: "Calculer la moyenne",   en: "Calculate GPA" },
  "calc.result":      { ar: "النتيجة",         fr: "Résultat",              en: "Result" },
  "calc.pass":        { ar: "ناجح",            fr: "Admis",                 en: "Pass" },
  "calc.fail":        { ar: "راسب",            fr: "Recalé",                en: "Fail" },
  "calc.yourAverage": { ar: "معدلك الإجمالي",  fr: "Votre moyenne générale", en: "Your GPA" },

  // ── Scientific Calculator ──────────────────────────────────────────────────
  "sciCalc.title": { ar: "الآلة الحاسبة العلمية", fr: "Calculatrice scientifique", en: "Scientific Calculator" },

  // ── Last Activity ──────────────────────────────────────────────────────────
  "activity.lastActivity":  { ar: "آخر نشاط",           fr: "Dernière activité", en: "Last Activity" },
  "activity.lastLesson":    { ar: "آخر درس",             fr: "Dernier cours",     en: "Last Lesson" },
  "activity.lastExam":      { ar: "آخر فرض",             fr: "Dernier examen",    en: "Last Exam" },
  "activity.lastTest":      { ar: "آخر اختبار",          fr: "Dernier test",      en: "Last Test" },
  "activity.lastHomework":  { ar: "آخر واجب منزلي",     fr: "Dernier devoir",    en: "Last Homework" },
  "activity.continueStudy": { ar: "متابعة الدراسة",      fr: "Continuer à étudier", en: "Continue Studying" },

  // ── Admin ──────────────────────────────────────────────────────────────────
  "admin.dashboard":      { ar: "لوحة التحكم",          fr: "Tableau de bord",          en: "Dashboard" },
  "admin.stats":          { ar: "الإحصائيات",           fr: "Statistiques",             en: "Statistics" },
  "admin.users":          { ar: "المستخدمون",           fr: "Utilisateurs",             en: "Users" },
  "admin.levels":         { ar: "المستويات",            fr: "Niveaux",                  en: "Levels" },
  "admin.branches":       { ar: "الشعب",                fr: "Filières",                 en: "Branches" },
  "admin.subjects":       { ar: "المواد",               fr: "Matières",                 en: "Subjects" },
  "admin.lessons":        { ar: "الدروس",               fr: "Cours",                    en: "Lessons" },
  "admin.exams":          { ar: "الفروض",               fr: "Épreuves",                 en: "Exams" },
  "admin.tests":          { ar: "الاختبارات",           fr: "Tests",                    en: "Tests" },
  "admin.homework":       { ar: "الواجبات المنزلية",    fr: "Devoirs",                  en: "Homework" },
  "admin.baccalaureates": { ar: "البكالوريات",          fr: "Baccalauréats",            en: "Baccalaureates" },
  "admin.reviewChannels": { ar: "قنوات المراجعة",       fr: "Chaînes de révision",      en: "Review Channels" },
  "admin.announcements":  { ar: "الإعلانات",            fr: "Annonces",                 en: "Announcements" },
  "admin.notifications":  { ar: "الإشعارات",            fr: "Notifications",            en: "Notifications" },
  "admin.langSettings":   { ar: "اللغات",               fr: "Langues",                  en: "Languages" },
  "admin.backup":         { ar: "النسخ الاحتياطي",      fr: "Sauvegarde",               en: "Backup" },
  "admin.auditLogs":      { ar: "سجل المراجعة",         fr: "Journal d'audit",          en: "Audit Logs" },
  "admin.panel":          { ar: "لوحة الإدارة",         fr: "Panel Admin",              en: "Admin Panel" },
  "admin.superAdmin":     { ar: "مدير عام",             fr: "Super Admin",              en: "Super Admin" },
  "admin.totalUsers":     { ar: "إجمالي المستخدمين",   fr: "Total utilisateurs",       en: "Total Users" },
  "admin.content":        { ar: "المحتوى",              fr: "Contenu",                  en: "Content" },
  "admin.pdfFiles":       { ar: "ملفات PDF",            fr: "Fichiers PDF",             en: "PDF Files" },
  "admin.lessonVideos":   { ar: "فيديوهات الدروس",      fr: "Vidéos de cours",          en: "Lesson Videos" },
  "admin.channelVideos":  { ar: "فيديوهات القنوات",     fr: "Vidéos de chaînes",        en: "Channel Videos" },
  "admin.usersByLevel":   { ar: "توزيع المستخدمين حسب المستوى", fr: "Répartition par niveau", en: "Users by Level" },
  "admin.active":         { ar: "نشط",                  fr: "Actif",                    en: "Active" },
  "admin.inactive":       { ar: "غير نشط",              fr: "Inactif",                  en: "Inactive" },
  "admin.role":           { ar: "الدور",                fr: "Rôle",                     en: "Role" },
  "admin.createdAt":      { ar: "تاريخ الإنشاء",        fr: "Date de création",         en: "Created At" },
  "admin.addNew":         { ar: "إضافة جديد",           fr: "Ajouter nouveau",          en: "Add New" },
  "admin.noItems":        { ar: "لا توجد عناصر",        fr: "Aucun élément",            en: "No items" },
  "admin.breadcrumb":     { ar: "الرئيسية",             fr: "Accueil",                  en: "Home" },
  "admin.actions":        { ar: "إجراءات",              fr: "Actions",                  en: "Actions" },
  "admin.name":           { ar: "الاسم",                fr: "Nom",                      en: "Name" },
  "admin.email":          { ar: "البريد الإلكتروني",    fr: "Email",                    en: "Email" },
  "admin.status":         { ar: "الحالة",               fr: "Statut",                   en: "Status" },
  "admin.save":           { ar: "حفظ",                  fr: "Enregistrer",              en: "Save" },
  "admin.cancel":         { ar: "إلغاء",                fr: "Annuler",                  en: "Cancel" },
  "admin.delete":         { ar: "حذف",                  fr: "Supprimer",                en: "Delete" },
  "admin.edit":           { ar: "تعديل",                fr: "Modifier",                 en: "Edit" },
  "admin.confirmDelete":  { ar: "هل أنت متأكد من الحذف؟", fr: "Êtes-vous sûr de supprimer ?", en: "Are you sure you want to delete?" },
  "admin.successAdd":     { ar: "تمت الإضافة بنجاح",   fr: "Ajout réussi",             en: "Added successfully" },
  "admin.successEdit":    { ar: "تم التعديل بنجاح",    fr: "Modification réussie",     en: "Updated successfully" },
  "admin.successDelete":  { ar: "تم الحذف بنجاح",      fr: "Suppression réussie",      en: "Deleted successfully" },
  "admin.errorAdd":       { ar: "فشل في الإضافة",       fr: "Échec de l'ajout",         en: "Failed to add" },
  "admin.errorEdit":      { ar: "فشل في التعديل",       fr: "Échec de la modification", en: "Failed to update" },
  "admin.errorDelete":    { ar: "فشل في الحذف",         fr: "Échec de la suppression",  en: "Failed to delete" },
  "admin.logout":         { ar: "تسجيل الخروج",         fr: "Se déconnecter",           en: "Sign out" },
} as const;

export type TranslationKey = keyof typeof translations;
