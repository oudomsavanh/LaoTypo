# 🔗 Google Sheets Integration Setup Guide

This guide will help you set up a private Google Sheet to manage your game words.

## 📋 Step 1: Create Your Private Google Sheet

1. **Go to Google Sheets**: https://sheets.google.com
2. **Create a new sheet** with this exact structure:

| A (Context) | B (Correct) | C (Incorrect) | D (Difficulty) |
|-------------|-------------|---------------|----------------|
| ສະບາຍດີ | ສະບາຍດີ | ສະບາຍດີີ | 1 |
| ຂອບໃຈ | ຂອບໃຈ | ຂອບຈັຍ | 1 |
| ລາວ | ລາວ | ລາຍ | 1 |
| ສວຍງາມ | ສວຍງາມ | ສວຍງາມມ | 1 |
| ດີ | ດີ | ດີີ | 1 |
| ບໍ່ດີ | ບໍ່ດີ | ບໍດີ | 1 |
| ຂໍອະໄພ | ຂໍອະໄພ | ຂໍອະໄພພ | 1 |
| ຍິນດີ | ຍິນດີ | ຍິນດີີ | 1 |
| ຄອບຄົວ | ຄອບຄົວ | ຄອບຄົວວ | 1 |
| ເຮືອນ | ເຮືອນ | ເຮືອນນ | 1 |
| ອາຫານ | ອາຫານ | ອາຫານນ | 1 |
| ນ້ຳ | ນ້ຳ | ນຳ | 1 |
| ອາກາດ | ອາກາດ | ອາກາດດ | 1 |
| ດອກໄມ້ | ດອກໄມ້ | ດອກໄມ້້ | 1 |
| ສັດ | ສັດ | ສັດດ | 1 |
| ຄົນທີ່ຂັບລົດ | ຄົນຂັບ | ຄົນຂັບຣ໌ | 2 |
| ຜູ້ທີ່ມັກເວົ້າ | ຄົນຂີ້ຄຸຍ | ຄົນຂີຄຸ້ຍ | 2 |
| ຜູ້ທີ່ມັກຫຼອກລວງ | ຄົນຂີ້ຕົວະ | ຄົນຂີຕົ້ວະ | 2 |
| ພາສາລາວ | ພາສາລາວ | ພາສາລາຍ | 2 |
| ໂຮງຮຽນ | ໂຮງຮຽນ | ໂຮງຮິຽນ | 2 |
| ປະເທດລາວ | ປະເທດລາວ | ປະເທດລາຍ | 2 |
| ວັດທະນະທຳ | ວັດທະນະທຳ | ວັດທະນະທຳຳ | 2 |
| ປະຫວັດສາດ | ປະຫວັດສາດ | ປະຫວັດສາດດ | 2 |
| ການສຶກສາ | ການສຶກສາ | ການສຶກສາະ | 2 |
| ການແພດ | ການແພດ | ການແພດດ | 2 |
| ການທ່ອງທ່ຽວ | ການທ່ອງທ່ຽວ | ການທ່ອງທ່ຽວວ | 2 |
| ການຄ້າ | ການຄ້າ | ການຄ້າະ | 2 |
| ການກະສິກຳ | ການກະສິກຳ | ການກະສິກຳຳ | 2 |
| ການອຸດສາຫະກຳ | ການອຸດສາຫະກຳ | ການອຸດສາຫະກຳຳ | 2 |
| ຄອມພິວເຕີ | ຄອມພິວເຕີ | ຄອມພິຍເຕີ | 3 |
| ວິທະຍາສາດ | ວິທະຍາສາດ | ວິທະຍາສາຍ | 3 |
| ເຕັກໂນໂລຊີ | ເຕັກໂນໂລຊີ | ເຕັກໂນໂລຊິ | 3 |
| ການພັດທະນາ | ການພັດທະນາ | ການພັດທະນາະ | 3 |
| ການວິໄຈ | ການວິໄຈ | ການວິໄຈຈ | 3 |
| ການປະດິດສ້າງ | ການປະດິດສ້າງ | ການປະດິດສ້າງງ | 3 |
| ການປະຕິບັດ | ການປະຕິບັດ | ການປະຕິບັດດ | 3 |
| ການປະສົບຜົນສຳເລັດ | ການປະສົບຜົນສຳເລັດ | ການປະສົບຜົນສຳເລັດດ | 3 |
| ການປະສົມປະສານ | ການປະສົມປະສານ | ການປະສົມປະສານນ | 3 |
| ການປະຕິບັດຕາມ | ການປະຕິບັດຕາມ | ການປະຕິບັດຕາມມ | 3 |

3. **Keep it private** (don't share with anyone)
4. **Copy the Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`

## 🔧 Step 2: Set Up Google Apps Script

1. **Go to Google Apps Script**: https://script.google.com
2. **Create a new project**
3. **Replace the default code** with the code from `google-sheets-setup.js`
4. **Update the Sheet ID**: Replace `YOUR_SHEET_ID_HERE` with your actual sheet ID
5. **Save the project** (Ctrl+S)
6. **Deploy as web app**:
   - Click "Deploy" → "New deployment"
   - Choose "Web app" as type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
7. **Copy the web app URL** (it will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

## 🎮 Step 3: Update Your Game

1. **Open `play.html`** in your code editor
2. **Find this line**:
   ```javascript
   const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
3. **Replace `YOUR_SCRIPT_ID`** with your actual script ID from step 2
4. **Save the file**

## ✅ Step 4: Test Your Setup

1. **Open your game** in the browser
2. **Check the console** (F12) for any errors
3. **The game should now load words from your private Google Sheet!**

## 🔒 Security Benefits

- **Private Sheet**: Only you can access and edit the words
- **No Public URLs**: The sheet ID is not exposed in the game
- **Easy Management**: Add/edit words directly in Google Sheets
- **Real-time Updates**: Changes appear in the game immediately

## 📝 Adding More Words

To add more words:
1. **Open your Google Sheet**
2. **Add new rows** with the same format (Context, Correct, Incorrect, Difficulty)
3. **Save the sheet**
4. **Refresh your game** - new words will appear automatically!

## 🛠️ Troubleshooting

**If words don't load:**
1. Check that your Google Apps Script is deployed correctly
2. Verify the Sheet ID is correct in the script
3. Make sure the sheet has the correct column headers
4. Check the browser console for error messages

**If you get permission errors:**
1. Make sure the Apps Script is deployed with "Anyone" access
2. Check that the sheet is not restricted to specific users