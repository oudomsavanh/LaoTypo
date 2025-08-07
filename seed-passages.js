// Script to seed Lao passages into Firestore
const admin = require('firebase-admin');

// Initialize admin SDK with service account
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Sample Lao passages
const passages = [
    {
        id: 'passage_001',
        title: 'ສະບາຍດີ ລາວ',
        content: 'ສະບາຍດີ ຂ້ອຍ ມາ ຈາກ ປະເທດ ລາວ ພວກເຮົາ ມີ ວັດທະນະທຳ ທີ່ ງົດງາມ ແລະ ອາຫານ ທີ່ ແຊບ ຫຼາຍ',
        level: 'Easy',
        wordCount: 15,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'passage_002',
        title: 'ວັດທະນະທຳລາວ',
        content: 'ປະເທດລາວ ມີປະຫວັດສາດ ອັນຍາວນານ ພຣະທາດຫຼວງ ເປັນສັນຍາລັກ ທີ່ສຳຄັນ ຂອງຊາດ ປະຊາຊົນລາວ ມີນິໄສຮັກສະຫງົບ ແລະມີນ້ຳໃຈ',
        level: 'Medium',
        wordCount: 20,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'passage_003',
        title: 'ພາສາລາວທີ່ສວຍງາມ',
        content: 'ພາສາລາວ ເປັນພາສາ ທີ່ມີຄວາມໄພເລາະ ການອອກສຽງ ມີລັກສະນະພິເສດ ຕົວອັກສອນລາວ ມີຮູບຮ່າງ ທີ່ສວຍງາມ ການຮຽນພາສາລາວ ຕ້ອງການຄວາມອົດທົນ ແລະຝຶກຝົນ ເປັນປະຈຳ',
        level: 'Hard',
        wordCount: 25,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'passage_004',
        title: 'ອາຫານລາວ',
        content: 'ອາຫານລາວ ມີລົດຊາດ ທີ່ເປັນເອກະລັກ ຕຳໝາກຫຸ່ງ ເປັນອາຫານ ທີ່ຄົນລາວ ມັກກິນ ເຂົ້າໜຽວ ເປັນອາຫານຫຼັກ ຂອງຄົນລາວ',
        level: 'Easy',
        wordCount: 18,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        id: 'passage_005',
        title: 'ທຳມະຊາດລາວ',
        content: 'ປະເທດລາວ ມີທຳມະຊາດ ທີ່ອຸດົມສົມບູນ ມີແມ່ນ້ຳຂອງ ໄຫຼຜ່ານ ມີພູຜາ ແລະປ່າໄມ້ ທີ່ສວຍງາມ ນ້ຳຕົກຕາດ ເປັນສະຖານທີ່ ທ່ອງທ່ຽວ ທີ່ມີຊື່ສຽງ',
        level: 'Medium',
        wordCount: 22,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
];

async function seedPassages() {
    console.log('🌱 Starting to seed passages...');
    
    const batch = db.batch();
    
    passages.forEach(passage => {
        const docRef = db.collection('passages').doc(passage.id);
        batch.set(docRef, passage);
        console.log(`✅ Added passage: ${passage.title}`);
    });
    
    try {
        await batch.commit();
        console.log('🎉 All passages seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding passages:', error);
    }
    
    process.exit(0);
}

seedPassages();