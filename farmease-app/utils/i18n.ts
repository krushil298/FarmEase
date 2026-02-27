// =============================================
// FarmEase i18n — English & Hindi translations
// =============================================

export type Language = 'en' | 'hi';

const translations = {
    en: {
        // ---- Common ----
        common: {
            appName: 'FarmEase',
            tagline: 'From Soil to Sale',
            ok: 'OK',
            cancel: 'Cancel',
            save: 'Save',
            back: 'Back',
            loading: 'Loading...',
            signOut: 'Sign Out',
            version: 'FarmEase v1.0.0',
            seeAll: 'See All →',
            language: 'Language',
            english: 'English',
            hindi: 'हिंदी',
            selectLanguage: 'Select Language',
            user: 'User',
            notSet: 'Not set',
        },

        // ---- Login ----
        login: {
            title: 'Login / Sign Up',
            otpTitle: 'Enter OTP (Try 123456)',
            phoneLabel: 'Phone Number',
            phonePlaceholder: 'Enter 10-digit number',
            otpLabel: 'OTP',
            otpPlaceholder: 'Enter 6-digit OTP',
            sendOtp: 'Send OTP',
            verifyOtp: 'Verify OTP',
            resendOtp: 'Resend OTP',
            terms: 'By continuing, you agree to our Terms of Service',
            phoneError: 'Please enter a valid 10-digit phone number',
            otpError: 'Please enter the 6-digit OTP',
            invalidOtp: 'Invalid OTP',
            otpFailed: 'Failed to send OTP',
            languageLabel: 'Preferred Language',
        },

        // ---- Role Select ----
        roleSelect: {
            title: 'Welcome to FarmEase',
            subtitle: 'Select your role to continue:',
            farmerTitle: "I'm a Farmer",
            farmerDesc: 'Grow, detect diseases, get recommendations & sell your crops',
            buyerTitle: "I'm a Buyer",
            buyerDesc: 'Browse fresh crops, buy directly from farmers at fair prices',
        },

        // ---- Register Farmer ----
        registerFarmer: {
            title: 'Farmer Registration',
            subtitle: 'Set up your farmer profile',
            nameLabel: 'Full Name',
            namePlaceholder: 'Enter your name',
            locationLabel: 'Farm Location',
            locationPlaceholder: 'Village, District, State',
            farmSizeLabel: 'Farm Size (acres)',
            farmSizePlaceholder: 'e.g. 2.5',
            submit: 'Complete Registration',
        },

        // ---- Register Buyer ----
        registerBuyer: {
            title: 'Buyer Registration',
            subtitle: 'Set up your buyer profile',
            nameLabel: 'Full Name',
            namePlaceholder: 'Enter your name',
            addressLabel: 'Delivery Address',
            addressPlaceholder: 'Full address for deliveries',
            submit: 'Complete Registration',
        },

        // ---- Dashboard (Farmer) ----
        dashboard: {
            greeting: 'Quick Actions',
            quickActions: 'Quick Actions',
            diseaseDetection: 'Disease Detection',
            diseaseDetectionDesc: 'Scan crop leaves',
            cropRecommend: 'Crop Recommend',
            cropRecommendDesc: 'Get best crops',
            marketplace: 'Marketplace',
            marketplaceDesc: 'Buy & sell crops',
            rentEquipment: 'Rent Equipment',
            rentEquipmentDesc: 'Rent from locals',
            govSchemes: 'Gov Schemes',
            govSchemesDesc: 'Browse schemes',
            shopCategories: 'Shop Popular Categories',
            seasonalTip: 'Seasonal Tip',
            seasonalTipText: 'Prepare soil for monsoon crops!',
            marketAlert: 'Market Alert',
            marketAlertText: 'Tomato prices rising — list now!',
            healthTip: 'Health Tip',
            healthTipText: 'Check wheat for rust disease',
            setLocation: 'Set your location',
            goodMorning: 'Good Morning',
            goodAfternoon: 'Good Afternoon',
            goodEvening: 'Good Evening',
        },

        // ---- Buyer Dashboard ----
        buyerDashboard: {
            subtitle: 'Find fresh produce near you 🌿',
            todaysDeals: "🔥 Today's Best Deals",
            browseCategories: '🛒 Browse Categories',
            nearbyFarmers: '📍 Farmers Near You',
            quickActions: '⚡ Quick Actions',
            shopNow: 'Shop Now',
            myCart: 'My Cart',
            schemes: 'Schemes',
            mandiTitle: "Today's Mandi Prices",
            mandiSubtext: 'Tomato ₹45/kg ↑ • Rice ₹85/kg → • Wheat ₹40/kg ↓',
            vegetables: 'Vegetables',
            fruits: 'Fruits',
            grains: 'Grains',
            spices: 'Spices',
            pulses: 'Pulses',
            dairy: 'Dairy',
            visit: 'Visit →',
        },

        // ---- Marketplace ----
        marketplace: {
            title: 'Marketplace',
            searchPlaceholder: 'Search crops, vegetables...',
            mandiTitle: "Today's Mandi Prices",
            mandiSubtext: 'Live rates from your nearest mandi',
            addListing: '+ Add Listing',
            noProducts: 'No products found',
            noProductsDesc: 'Try a different search or category',
            addToCart: 'Add to Cart',
            loading: 'Setting up your marketplace',
            loadingSubtext: 'Handpicked from local farmers 🌿',
            deals: {
                tomatoes: 'Farm Fresh Tomatoes',
                rice: 'Organic Basmati Rice',
                mangoes: 'Fresh Alphonso Mangoes',
            },
        },

        // ---- Disease Detection ----
        detect: {
            title: 'Disease Detection',
            subtitle: 'Position crop leaf within the frame',
            gallery: 'Gallery',
            flash: 'Flash',
            retake: 'Retake',
            analyze: 'Analyze Disease',
            analyzing: 'Analyzing...',
            permissionTitle: 'Camera Access Needed',
            permissionDesc: 'FarmEase needs camera access to scan your crop leaves for disease detection',
            grantPermission: 'Grant Permission',
        },

        // ---- Profile ----
        profile: {
            title: 'Profile',
            farmer: 'Farmer',
            buyer: 'Buyer',
            myOrders: 'My Orders',
            diseaseHistory: 'Disease History',
            myListings: 'My Listings',
            savedSchemes: 'Saved Schemes',
            language: 'Language',
            helpSupport: 'Help & Support',
            about: 'About FarmEase',
            signOut: 'Sign Out',
        },

        // ---- Cart ----
        cart: {
            title: 'Cart',
            clearAll: 'Clear All',
            emptyTitle: 'Your Cart is Empty',
            emptySubtitle: 'Browse the marketplace and add fresh produce to your cart',
            browseMarketplace: 'Browse Marketplace',
            orderSummary: 'Order Summary',
            subtotal: 'Subtotal',
            deliveryFee: 'Delivery Fee',
            total: 'Total',
            placeOrder: 'Place Order',
            orderSuccess: '🎉 Order Placed!',
            orderSuccessMsg: 'You will receive a confirmation call from the seller shortly.',
            done: 'Done',
        },

        // ---- Rentals ----
        rentals: {
            title: 'Rent Equipment',
            searchPlaceholder: 'Search tractors, sprayers...',
            perDay: '/day',
            contact: 'Contact',
            callOwner: 'Call Owner',
        },

        // ---- Schemes ----
        schemes: {
            title: 'Government Schemes',
            subtitle: "Find schemes you're eligible for",
            description: 'Description',
            eligibility: 'Eligibility',
            deadline: 'Deadline',
            checkEligibility: 'Check Eligibility →',
        },

        // ---- Crop Recommend ----
        cropRecommend: {
            title: 'Crop Recommendation',
            resultsTitle: 'Top 5 Recommended Crops',
            formTitle: 'Enter Your Soil & Climate Data',
            soilType: 'Soil Type',
            phLevel: 'pH Level',
            phPlaceholder: 'e.g. 6.8',
            temperature: 'Temperature (°C)',
            tempPlaceholder: 'e.g. 28',
            humidity: 'Humidity (%)',
            humidityPlaceholder: 'e.g. 70',
            rainfall: 'Rainfall (mm)',
            rainfallPlaceholder: 'e.g. 1200',
            getRecommendations: 'Get Recommendations',
            tryDifferent: 'Try Different Inputs',
        },

        // ---- Fertilizer ----
        fertilizer: {
            title: 'Fertilizer Advisory',
            resultsTitle: 'Fertilizer Recommendation',
            formTitle: 'Enter Soil Nutrient Levels',
            nitrogenLabel: 'Nitrogen (N) Level',
            nitrogenPlaceholder: 'e.g. 40',
            phosphorusLabel: 'Phosphorus (P) Level',
            phosphorusPlaceholder: 'e.g. 35',
            potassiumLabel: 'Potassium (K) Level',
            potassiumPlaceholder: 'e.g. 50',
            cropTypeLabel: 'Crop Type',
            cropTypePlaceholder: 'e.g. Rice, Wheat, Cotton',
            getAdvice: 'Get Fertilizer Advice',
            tryDifferent: 'Try Different Values',
            soilSummary: 'Soil Analysis Summary',
            recommended: 'Recommended Fertilizers',
        },

        // ---- Daily Tip Modal ----
        tipModal: {
            tipOfDay: '🌤️ Tip of the Day',
            gotIt: 'Got it!',
            tipOfDayLabel: 'Tip of the Day',
        },

        // ---- Weather Widget ----
        weather: {
            humidity: 'Humidity',
            wind: 'Wind',
            feelsLike: 'Feels Like',
            loading: 'Loading weather...',
        },

        // ---- Tab Navigation ----
        tabs: {
            home: 'Home',
            scan: 'Scan',
            market: 'Market',
            rentals: 'Rentals',
            profile: 'Profile',
        },
        // ---- Marketplace Categories ----
        categories: {
            seeds: 'Seeds',
            fertilizers: 'Fertilizers',
            pesticides: 'Pesticides',
            crops: 'Crops',
        },
    },

    hi: {
        // ---- Common ----
        common: {
            appName: 'फार्मईज़',
            tagline: 'मिट्टी से बिक्री तक',
            ok: 'ठीक है',
            cancel: 'रद्द करें',
            save: 'सहेजें',
            back: 'वापस',
            loading: 'लोड हो रहा है...',
            signOut: 'साइन आउट',
            version: 'फार्मईज़ v1.0.0',
            seeAll: 'सभी देखें →',
            language: 'भाषा',
            english: 'English',
            hindi: 'हिंदी',
            selectLanguage: 'भाषा चुनें',
            user: 'उपयोगकर्ता',
            notSet: 'सेट नहीं है',
        },

        // ---- Login ----
        login: {
            title: 'लॉगिन / साइन अप',
            otpTitle: 'OTP दर्ज करें (123456 आज़माएं)',
            phoneLabel: 'फ़ोन नंबर',
            phonePlaceholder: '10 अंकों का नंबर दर्ज करें',
            otpLabel: 'OTP',
            otpPlaceholder: '6 अंकों का OTP दर्ज करें',
            sendOtp: 'OTP भेजें',
            verifyOtp: 'OTP सत्यापित करें',
            resendOtp: 'OTP फिर से भेजें',
            terms: 'जारी रखने पर आप हमारी सेवा शर्तों से सहमत हैं',
            phoneError: 'कृपया 10 अंकों का वैध फ़ोन नंबर दर्ज करें',
            otpError: 'कृपया 6 अंकों का OTP दर्ज करें',
            invalidOtp: 'अमान्य OTP',
            otpFailed: 'OTP भेजने में विफल',
            languageLabel: 'पसंदीदा भाषा',
        },

        // ---- Role Select ----
        roleSelect: {
            title: 'फार्मईज़ में आपका स्वागत है',
            subtitle: 'जारी रखने के लिए अपनी भूमिका चुनें:',
            farmerTitle: 'मैं एक किसान हूं',
            farmerDesc: 'उगाएं, रोगों का पता लगाएं, सुझाव प्राप्त करें और फसलें बेचें',
            buyerTitle: 'मैं एक खरीदार हूं',
            buyerDesc: 'ताज़ी फसलें ब्राउज़ करें, किसानों से सीधे उचित कीमत पर खरीदें',
        },

        // ---- Register Farmer ----
        registerFarmer: {
            title: 'किसान पंजीकरण',
            subtitle: 'अपनी किसान प्रोफ़ाइल सेट करें',
            nameLabel: 'पूरा नाम',
            namePlaceholder: 'अपना नाम दर्ज करें',
            locationLabel: 'खेत का स्थान',
            locationPlaceholder: 'गांव, जिला, राज्य',
            farmSizeLabel: 'खेत का आकार (एकड़)',
            farmSizePlaceholder: 'जैसे 2.5',
            submit: 'पंजीकरण पूरा करें',
        },

        // ---- Register Buyer ----
        registerBuyer: {
            title: 'खरीदार पंजीकरण',
            subtitle: 'अपनी खरीदार प्रोफ़ाइल सेट करें',
            nameLabel: 'पूरा नाम',
            namePlaceholder: 'अपना नाम दर्ज करें',
            addressLabel: 'डिलीवरी पता',
            addressPlaceholder: 'डिलीवरी के लिए पूरा पता',
            submit: 'पंजीकरण पूरा करें',
        },

        // ---- Dashboard (Farmer) ----
        dashboard: {
            greeting: 'त्वरित क्रियाएं',
            quickActions: 'त्वरित क्रियाएं',
            diseaseDetection: 'रोग पहचान',
            diseaseDetectionDesc: 'फसल की पत्तियां स्कैन करें',
            cropRecommend: 'फसल सुझाव',
            cropRecommendDesc: 'सर्वश्रेष्ठ फसलें पाएं',
            marketplace: 'बाज़ार',
            marketplaceDesc: 'फसलें खरीदें और बेचें',
            rentEquipment: 'उपकरण किराए पर लें',
            rentEquipmentDesc: 'स्थानीय लोगों से किराए पर लें',
            govSchemes: 'सरकारी योजनाएं',
            govSchemesDesc: 'योजनाएं ब्राउज़ करें',
            shopCategories: 'लोकप्रिय श्रेणियां खरीदें',
            seasonalTip: 'मौसमी सुझाव',
            seasonalTipText: 'मानसून फसलों के लिए मिट्टी तैयार करें!',
            marketAlert: 'बाज़ार अलर्ट',
            marketAlertText: 'टमाटर की कीमतें बढ़ रही हैं — अभी सूचीबद्ध करें!',
            healthTip: 'स्वास्थ्य सुझाव',
            healthTipText: 'गेहूं में रतुआ रोग की जांच करें',
            setLocation: 'अपना स्थान सेट करें',
            goodMorning: 'सुप्रभात',
            goodAfternoon: 'नमस्ते',
            goodEvening: 'शुभ संध्या',
        },

        // ---- Buyer Dashboard ----
        buyerDashboard: {
            subtitle: 'आपके पास ताज़ा उपज खोजें 🌿',
            todaysDeals: '🔥 आज के सर्वश्रेष्ठ सौदे',
            browseCategories: '🛒 श्रेणियां ब्राउज़ करें',
            nearbyFarmers: '📍 आपके पास के किसान',
            quickActions: '⚡ त्वरित क्रियाएं',
            shopNow: 'अभी खरीदें',
            myCart: 'मेरी टोकरी',
            schemes: 'योजनाएं',
            mandiTitle: 'आज की मंडी कीमतें',
            mandiSubtext: 'टमाटर ₹45/किग्रा ↑ • चावल ₹85/किग्रा → • गेहूं ₹40/किग्रा ↓',
            vegetables: 'सब्जियां',
            fruits: 'फल',
            grains: 'अनाज',
            spices: 'मसाले',
            pulses: 'दालें',
            dairy: 'डेयरी',
            visit: 'देखें →',
        },

        // ---- Marketplace ----
        marketplace: {
            title: 'बाज़ार',
            searchPlaceholder: 'फसलें, सब्जियां खोजें...',
            mandiTitle: 'आज की मंडी कीमतें',
            mandiSubtext: 'आपकी नज़दीकी मंडी से लाइव दरें',
            addListing: '+ लिस्टिंग जोड़ें',
            noProducts: 'कोई उत्पाद नहीं मिला',
            noProductsDesc: 'अलग खोज या श्रेणी आज़माएं',
            addToCart: 'टोकरी में जोड़ें',
            loading: 'आपका बाज़ार तैयार हो रहा है',
            loadingSubtext: 'स्थानीय किसानों से चुना गया 🌿',
            deals: {
                tomatoes: 'फार्म ताजा टमाटर',
                rice: 'जैविक बासमती चावल',
                mangoes: 'ताजा अल्फांसो आम',
            },
        },

        // ---- Disease Detection ----
        detect: {
            title: 'रोग पहचान',
            subtitle: 'फ्रेम के अंदर फसल की पत्ती रखें',
            gallery: 'गैलरी',
            flash: 'फ्लैश',
            retake: 'फिर से लें',
            analyze: 'रोग विश्लेषण करें',
            analyzing: 'विश्लेषण हो रहा है...',
            permissionTitle: 'कैमरा अनुमति आवश्यक',
            permissionDesc: 'फार्मईज़ को फसल की पत्तियों को स्कैन करने के लिए कैमरा अनुमति चाहिए',
            grantPermission: 'अनुमति दें',
        },

        // ---- Profile ----
        profile: {
            title: 'प्रोफ़ाइल',
            farmer: 'किसान',
            buyer: 'खरीदार',
            myOrders: 'मेरे ऑर्डर',
            diseaseHistory: 'रोग इतिहास',
            myListings: 'मेरी लिस्टिंग',
            savedSchemes: 'सहेजी गई योजनाएं',
            language: 'भाषा',
            helpSupport: 'सहायता',
            about: 'फार्मईज़ के बारे में',
            signOut: 'साइन आउट',
        },

        // ---- Cart ----
        cart: {
            title: 'टोकरी',
            clearAll: 'सब हटाएं',
            emptyTitle: 'आपकी टोकरी खाली है',
            emptySubtitle: 'बाज़ार ब्राउज़ करें और ताज़ी उपज जोड़ें',
            browseMarketplace: 'बाज़ार ब्राउज़ करें',
            orderSummary: 'ऑर्डर सारांश',
            subtotal: 'उप-कुल',
            deliveryFee: 'डिलीवरी शुल्क',
            total: 'कुल',
            placeOrder: 'ऑर्डर दें',
            orderSuccess: '🎉 ऑर्डर दे दिया!',
            orderSuccessMsg: 'विक्रेता जल्द ही आपको कॉल करेगा।',
            done: 'हो गया',
        },

        // ---- Rentals ----
        rentals: {
            title: 'उपकरण किराए पर लें',
            searchPlaceholder: 'ट्रैक्टर, स्प्रेयर खोजें...',
            perDay: '/दिन',
            contact: 'संपर्क',
            callOwner: 'मालिक को कॉल करें',
        },

        // ---- Schemes ----
        schemes: {
            title: 'सरकारी योजनाएं',
            subtitle: 'अपनी पात्रता की योजनाएं खोजें',
            description: 'विवरण',
            eligibility: 'पात्रता',
            deadline: 'अंतिम तिथि',
            checkEligibility: 'पात्रता जांचें →',
        },

        // ---- Crop Recommend ----
        cropRecommend: {
            title: 'फसल सुझाव',
            resultsTitle: 'शीर्ष 5 अनुशंसित फसलें',
            formTitle: 'मिट्टी और जलवायु डेटा दर्ज करें',
            soilType: 'मिट्टी का प्रकार',
            phLevel: 'pH स्तर',
            phPlaceholder: 'जैसे 6.8',
            temperature: 'तापमान (°C)',
            tempPlaceholder: 'जैसे 28',
            humidity: 'आर्द्रता (%)',
            humidityPlaceholder: 'जैसे 70',
            rainfall: 'वर्षा (मिमी)',
            rainfallPlaceholder: 'जैसे 1200',
            getRecommendations: 'सुझाव प्राप्त करें',
            tryDifferent: 'अलग डेटा आज़माएं',
        },

        // ---- Fertilizer ----
        fertilizer: {
            title: 'उर्वरक सलाह',
            resultsTitle: 'उर्वरक अनुशंसा',
            formTitle: 'मिट्टी पोषक स्तर दर्ज करें',
            nitrogenLabel: 'नाइट्रोजन (N) स्तर',
            nitrogenPlaceholder: 'जैसे 40',
            phosphorusLabel: 'फास्फोरस (P) स्तर',
            phosphorusPlaceholder: 'जैसे 35',
            potassiumLabel: 'पोटेशियम (K) स्तर',
            potassiumPlaceholder: 'जैसे 50',
            cropTypeLabel: 'फसल प्रकार',
            cropTypePlaceholder: 'जैसे चावल, गेहूं, कपास',
            getAdvice: 'उर्वरक सलाह लें',
            tryDifferent: 'अलग मान आज़माएं',
            soilSummary: 'मिट्टी विश्लेषण सारांश',
            recommended: 'अनुशंसित उर्वरक',
        },

        // ---- Daily Tip Modal ----
        tipModal: {
            tipOfDay: '🌤️ आज का सुझाव',
            gotIt: 'समझ गया!',
            tipOfDayLabel: 'आज का सुझाव',
        },

        // ---- Weather Widget ----
        weather: {
            humidity: 'आर्द्रता',
            wind: 'हवा',
            feelsLike: 'महसूस होता है',
            loading: 'मौसम लोड हो रहा है...',
        },

        // ---- Tab Navigation ----
        tabs: {
            home: 'होम',
            scan: 'स्कैन',
            market: 'बाज़ार',
            rentals: 'किराये पर',
            profile: 'प्रोफ़ाइल',
        },
        // ---- Marketplace Categories ----
        categories: {
            seeds: 'बीज',
            fertilizers: 'उर्वरक',
            pesticides: 'कीटनाशक',
            crops: 'फसलें',
        },
    },
};

export type TranslationKeys = typeof translations.en;
export { translations };
