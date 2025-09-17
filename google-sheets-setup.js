/**
 * Google Apps Script for LaoTypo Game
 * 
 * Instructions:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this script
 * 4. Deploy as web app with "Anyone" access
 * 5. Copy the web app URL to use in your game
 */

function doGet(e) {
  try {
    // Get the spreadsheet ID from URL parameter or use default
    const sheetId = e.parameter.sheetId || 'YOUR_SHEET_ID_HERE'; // Replace with your actual sheet ID
    
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheets()[0]; // Get first sheet
    
    // Get all data
    const data = sheet.getDataRange().getValues();
    
    // Skip header row and convert to game format
    const gameWords = data.slice(1).map((row, index) => ({
      context: row[0] || '',
      correct: row[1] || '',
      incorrect: row[2] || '',
      difficulty: parseInt(row[3]) || 1,
      order: index + 1
    })).filter(word => word.context && word.correct && word.incorrect);
    
    // Return as JSON
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        words: gameWords,
        count: gameWords.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        words: [],
        count: 0
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  // Handle POST requests the same way
  return doGet(e);
}