// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// сохраняем/читаем выбранный язык
const saved = localStorage.getItem('lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    lng: saved,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      en: {
        translation: {
          // Global / header
          language: "Language",
          brand: "UrsaCortex Diagnostics",
          logout: "Logout",

          // Auth tabs & buttons
          sign_in: "Sign in",
          sign_up: "Sign up",
          login: "Login",
          forgot: "Forgot Password?",
          signing_in: "Signing in…",

          // Auth placeholders & labels + errors
          auth: {
            email_placeholder: "Enter your email",
            password_placeholder: "Enter your password",
            doctor_code_placeholder: "Enter your doctor code",
            show_password: "Show password",
            hide_password: "Hide password",
            im_doctor: "I am a Doctor",

            // Auth errors & notices
            incorrect_credentials: "Incorrect email or password.",
            no_account: "No account found with this email.",
            invalid_email: "Invalid email address.",
            too_many_requests: "Too many attempts. Please try again later.",
            network_error: "Network error. Check your connection.",
            generic_error: "Authentication error. Please try again.",

            verify_email_resent: "Please verify your email. We just re-sent the verification link.",
            account_unavailable: "This account is no longer available. Please contact support.",
            account_not_configured: "Account is not configured. Contact Administrator.",
            invalid_doctor_code: "Invalid doctor code.",
            doctor_verification_failed: "Doctor verification failed. Try again later.",
            doctor_code_required: "Doctor code is required.",
            email_in_use: "An account with this email already exists."
          },

          // Reset password modal
          reset: {
            title: "Reset password",
            title_done: "Check your email",
            subtitle: "Enter the email you used to register. We’ll send you a link to create a new password.",
            email_placeholder: "your@email.com",
            cancel: "Cancel",
            send_link: "Send reset link",
            sending: "Sending…",
            sent_blind: "If an account exists for this email, we've sent a reset link.",
            done: "Done",

            // Доп. ключи для UX
            enter_email: "Please enter your email.",
            error_generic: "Could not send reset email. Please try again.",
            sent_blind_for: "If an account exists for {{email}}, a password reset link has been sent."
          },

          // Welcome / Info
          welcome_h1: "Welcome to the Cognitive Perception Test!",
          welcome_cta: "Continue",
          welcome_body:
            "Thank you for participating in this short test. It is part of a scientific project aimed at better understanding how people perceive everyday situations. Your participation helps us explore new ways to support early brain health research. The test is simple and will only take a few minutes. When you're ready, click “New test” to begin.",
          welcome_image_alt: "Intro illustration",
          info_title: "About this research project",
          info_cta: "Start test",
          info_p1: "This test is part of a research study that explores how people understand images and everyday situations. We are especially interested in how this relates to memory and thinking abilities.",
          info_p2: "This test is part of a research study exploring how people interpret images and everyday situations. We are especially interested in how this relates to memory and cognitive abilities. Our goal is to discover new ways to support the early detection of conditions like Alzheimer’s disease. The information you provide may help us train artificial intelligence (AI) tools to better understand early changes in brain function. All responses are anonymous and used solely for research purposes.",
          info_image_alt: "Research study",

          // Navigation (Dashboard)
          nav_info: "Info",
          nav_new_test: "New test",
          nav_cases: "My test cases",
          user_label: "User: {{name}}",

          // Common table/labels
          date: "Date",
          time_to_complete: "Time to complete",
          results: "Results",
          describe: "Describe",
          finish: "Finish",

          // Registration (Sign up)
          reg: {
            // Field labels
            first_name: "First name",
            last_name: "Last name",
            gender: "Sex",
            dob: "Date of birth",
            email: "Email",
            password: "Password",
            confirm_password: "Confirm password",

            // Placeholders
            first_name_ph: "Enter your first name",
            last_name_ph: "Enter your last name",
            phone_ph: "Enter your phone number (optional)",
            create_password: "Create password",
            repeat_password: "Repeat password",

            // Gender buttons
            male: "Male",
            female: "Female",

            // UI text & errors
            notice:
              "This information will be used solely for research purposes and will remain anonymous.",
            creating: "Creating…",
            passwords_mismatch: "Passwords do not match.",
            age_range_error: "Age must be between 8 and 89 years"
          },
          desc: {
            title: "Tell Us What You See",
            how_to_write: "What you need to do",
            bullet1: "Describe everything you see in the picture — people, actions, objects, and interactions. Use full sentences. The more details, the better.",
            bullet2: "There are no right or wrong answers. Just describe what you see as clearly as you can. Your response will help us better understand how people perceive everyday situations.",
            image_alt: "Cognitive test image",
            placeholder: "Start typing your description here...",
            elapsed: "Elapsed time: {{seconds}} seconds",
            submit: "Submit my description",

            // Error modal
            error_title: "Submission Error",
            error_body: "You must enter a description before submitting.",
            ok: "OK"
            },
            user_error: {
            title: "Oops!",
            subtitle: "Please complete the following fields:",
            ok: "OK"
            },
            completion: {
            title: "Thank you for taking part!",
            success: "You’ve successfully completed the test.",
            total_time: "Total time: {{seconds}} seconds",
            done: "Done"
            },
            graph: {
            title: "Test Analysis Summary",
            found_seq: "🧠 Found categories (sequence):",
            transitions: "🔄 Transitions between fields:",
            missing: "📉 Missing categories:",
            density: "📈 Graph density:",
            distance: "📏 Path distance:",
            index_label: "Cognitive impairment index:",
            replay: "▶ Replay animation",
            dict_title: "Semantic Word Groups",
            your_text: "Your text"
            },
            cases: {
                back: "Back to list",
                empty_prefix: "You have no tests yet. Run a",
                empty_suffix: "to see it here.",
                open_details: "Open test details",
                test_n: "Test {{n}}"
                },
                units: {
                seconds_short: "s"
                }

        }
      },

      // SK ----------------------------------------------------------------SK----------------------------------------------------------------SK----------------------------------------------------------------SK----------------------------------------------------------------SK    
      sk: {
        translation: {
          // Global / header
          language: "Jazyk",
          brand: "UrsaCortex Diagnostics",
          logout: "Odhlásiť sa",

          // Auth tabs & buttons
          sign_in: "Prihlásiť sa",
          sign_up: "Vytvoriť účet",
          login: "Prihlásiť",
          forgot: "Zabudnuté heslo?",
          signing_in: "Prihlasovanie…",

          // Auth placeholders & labels + errors
          auth: {
            email_placeholder: "Zadajte svoj e-mail",
            password_placeholder: "Zadajte svoje heslo",
            doctor_code_placeholder: "Zadajte kód lekára",
            show_password: "Zobraziť heslo",
            hide_password: "Skryť heslo",
            im_doctor: "Som lekár",

            // Auth errors & notices
            incorrect_credentials: "Nesprávny e-mail alebo heslo.",
            no_account: "Pre tento e-mail sa nenašiel žiadny účet.",
            invalid_email: "Neplatná e-mailová adresa.",
            too_many_requests: "Príliš veľa pokusov. Skúste to neskôr.",
            network_error: "Chyba siete. Skontrolujte svoje pripojenie.",
            generic_error: "Chyba overenia. Skúste to znova.",

            verify_email_resent: "Prosím, potvrďte svoj e-mail. Práve sme znova poslali overovací odkaz.",
            account_unavailable: "Tento účet už nie je dostupný. Kontaktujte podporu.",
            account_not_configured: "Účet nie je nastavený. Kontaktujte administrátora.",
            invalid_doctor_code: "Neplatný kód lekára.",
            doctor_verification_failed: "Overenie lekára zlyhalo. Skúste to neskôr.",
            doctor_code_required: "Kód lekára je povinný.",
            email_in_use: "Účet s týmto e-mailom už existuje."
          },

          // Reset password modal
          reset: {
            title: "Obnovenie hesla",
            title_done: "Skontrolujte si e-mail",
            subtitle:
              "Zadajte e-mail, ktorý ste použili pri registrácii. Pošleme vám odkaz na vytvorenie nového hesla.",
            email_placeholder: "vas@email.com",
            cancel: "Zrušiť",
            send_link: "Poslať odkaz na obnovenie",
            sending: "Odosielanie…",
            sent_blind: "Ak pre tento e-mail existuje účet, poslali sme odkaz na obnovenie.",
            done: "Hotovo",

            // Доп. ключи для UX
            enter_email: "Zadajte, prosím, svoj e-mail.",
            error_generic: "Nepodarilo sa odoslať e-mail na obnovenie. Skúste to znova.",
            sent_blind_for: "Ak pre {{email}} existuje účet, bol odoslaný odkaz na obnovenie hesla."
          },

          // Welcome / Info
          welcome_h1: "Vitajte v teste kognitívneho vnímania!",
          welcome_cta: "Pokračovať",
          welcome_body:
            "Ďakujeme, že sa zúčastňujete tohto krátkeho testu. Test je súčasťou vedeckého projektu zameraného na lepšie pochopenie, ako ľudia vnímajú každodenné situácie. Vaša účasť nám pomáha hľadať nové spôsoby podpory výskumu včasného zdravia mozgu. Test je jednoduchý a zaberie iba niekoľko minút. Keď budete pripravení, kliknite na „Nový test“ a začnite.",
          welcome_image_alt: "Úvodná ilustrácia",
          info_title: "O výskumnom projekte",
          info_cta: "Začať test",
          info_p1: "Tento test je súčasťou výskumnej štúdie, ktorá skúma, ako ľudia rozumejú obrázkom a každodenným situáciám. Zaujíma nás najmä súvis s pamäťou a myslením.",
          info_p2: "Tento test je súčasťou výskumu, ktorý skúma, ako ľudia interpretujú obrázky a každodenné situácie. Zvlášť nás zaujíma, ako to súvisí s pamäťou a kognitívnymi schopnosťami. Naším cieľom je nájsť nové spôsoby podpory včasného záchytu stavov, ako je Alzheimerova choroba. Informácie, ktoré poskytnete, môžu pomôcť trénovať nástroje umelej inteligencie (AI) na lepšie porozumenie skorým zmenám funkcií mozgu. Všetky odpovede sú anonymné a použité výlučne na výskumné účely.",
          info_image_alt: "Výskumná štúdia",
          
          // Navigation (Dashboard)
          nav_info: "Informácie",
          nav_new_test: "Nový test",
          nav_cases: "Moje testy",
          user_label: "Používateľ: {{name}}",

          // Common table/labels
          date: "Dátum",
          time_to_complete: "Čas dokončenia",
          results: "Výsledky",
          describe: "Opis",
          finish: "Dokončiť",

          // Registration (Sign up)
          reg: {
            // Field labels
            first_name: "Meno",
            last_name: "Priezvisko",
            gender: "Pohlavie",
            dob: "Dátum narodenia",
            email: "E-mail",
            password: "Heslo",
            confirm_password: "Potvrdenie hesla",

            // Placeholders
            first_name_ph: "Zadajte svoje meno",
            last_name_ph: "Zadajte svoje priezvisko",
            phone_ph: "Zadajte telefón (voliteľné)",
            create_password: "Vytvorte heslo",
            repeat_password: "Zopakujte heslo",

            // Gender buttons
            male: "Muž",
            female: "Žena",

            // UI text & errors
            notice:
              "Tieto údaje budú použité len na výskumné účely a zostanú anonymné.",
            creating: "Vytváranie…",
            passwords_mismatch: "Heslá sa nezhodujú.",
            age_range_error: "Vek musí byť medzi 8 a 89 rokov"
          },
          desc: {
            title: "Povedzte nám, čo vidíte",
            how_to_write: "Čo musíte spraviť",
            bullet1: "Opíšte všetko, čo na obrázku vidíte — osoby, činnosti, objekty a interakcie. Používajte celé vety. Čím viac detailov, tým lepšie.",
            bullet2: "Neexistujú správne ani nesprávne odpovede. Jednoducho čo najjasnejšie opíšte, čo vidíte. Vaša odpoveď nám pomôže lepšie pochopiť, ako ľudia vnímajú každodenné situácie.",
            image_alt: "Obrázok kognitívneho testu",
            placeholder: "Začnite písať svoj opis…",
            elapsed: "Uplynutý čas: {{seconds}} s",
            submit: "Odoslať opis",

            // Error modal
            error_title: "Chyba odoslania",
            error_body: "Pred odoslaním musíte zadať opis.",
            ok: "OK"
            },
            user_error: {
            title: "Ups!",
            subtitle: "Prosím, vyplňte nasledujúce polia:",
            ok: "OK"
            },
            completion: {
            title: "Ďakujeme za účasť!",
            success: "Test ste úspešne dokončili.",
            total_time: "Celkový čas: {{seconds}} s",
            done: "Hotovo"
            },
            graph: {
            title: "Zhrnutie analýzy testovania",
            found_seq: "🧠 Nájdené kategórie (poradie):",
            transitions: "🔄 Prechody medzi oblasťami:",
            missing: "📉 Chýbajúce kategórie:",
            density: "📈 Hustota grafu:",
            distance: "📏 Dĺžka trasy:",
            index_label: "Index kognitívnej poruchy:",
            replay: "▶ Prehrať animáciu",
            dict_title: "Sémantické polia",
            your_text: "Váš text"
            },
            cases: {
            back: "Späť na zoznam",
            empty_prefix: "Zatiaľ nemáte žiadne testy. Spustite",
            empty_suffix: "aby sa zobrazil tu.",
            open_details: "Otvoriť detaily testu",
            test_n: "Test {{n}}"
            },
            units: {
            seconds_short: "s"
            }




        }
      }
    }
  });

export default i18n;
