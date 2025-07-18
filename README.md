# Word Game with Google Sheets Integration

A fun, interactive word game that uses Google Sheets as a database. Players choose between left and right options, trying to match a random result to score points.

## 🎮 Game Features

- **Player Name Input**: Personalized gaming experience
- **Context Display**: Shows word context from your Google Sheets database
- **Left/Right Choice**: Simple, engaging gameplay mechanics
- **Random Matching**: Players score when their choice matches the random result
- **Level Progression**: Displays difficulty levels from your database
- **Score Tracking**: Real-time score updates and level progression
- **Google Sheets Integration**: Dynamic content from your spreadsheet

## 🗃️ Database Structure

Your Google Sheets should have these columns:

| Column | Description | Example |
|--------|-------------|---------|
| context | The word or phrase to display | "The capital of France" |
| true | True option text | "Paris" |
| false | False option text | "London" |
| level | Difficulty level (1-10) | 1 |
| remark | Additional notes or hints | "Basic geography question" |

## 🚀 Quick Start

### Option 1: Demo Mode (No Setup Required)
1. Open `word-game.html` in your web browser
2. The game will run with sample data
3. Enter your name and start playing!

### Option 2: Connect to Google Sheets
1. Follow the [Google Sheets Setup Guide](google-sheets-setup-guide.md)
2. Update the configuration in `word-game.html`
3. Test your connection and play!

## 🎯 How to Play

1. **Enter Your Name**: Start by entering your player name
2. **View Context**: Read the word context displayed from your database
3. **Make Your Choice**: Click either LEFT ⬅️ or RIGHT ➡️
4. **Random Result**: The game generates a random left/right result
5. **Score Points**: Get +10 points when your choice matches the random result
6. **Level Up**: Progress through levels as you score more points
7. **Complete Rounds**: Play through 10 rounds to finish the game

## 🔧 Technical Details

### Files Structure
```
├── word-game.html              # Main game file
├── google-sheets-setup-guide.md # Setup instructions
└── README.md                   # This file
```

### Technologies Used
- **HTML5**: Game structure
- **CSS3**: Styling with Tailwind CSS
- **JavaScript**: Game logic and API integration
- **Google Sheets API**: Database connectivity

### Game Logic
- Random selection between left/right choices
- Score calculation: +10 points for correct matches
- Level progression: Every 50 points increases level
- 10 rounds per game session

## 📊 Google Sheets Integration

### Benefits
✅ **Easy Content Management**: Update words by editing your spreadsheet  
✅ **Real-time Updates**: Changes reflect immediately in the game  
✅ **Collaboration**: Multiple people can contribute to the word database  
✅ **No Database Setup**: Use Google Sheets as your backend  
✅ **Scalable**: Add unlimited words and categories  

### Connection Methods
1. **Public Sheet**: Simple setup, no API key required
2. **API Integration**: More secure, requires Google Cloud setup

## 🛠️ Setup Instructions

### For Public Google Sheets (Easiest)
1. Create a Google Sheet with the required columns
2. Make it public ("Anyone with the link can view")
3. Copy the sheet ID from the URL
4. Update the configuration in the game file

### For Private Sheets (More Secure)
1. Set up a Google Cloud project
2. Enable Google Sheets API
3. Create API credentials
4. Configure the game with your credentials

See the [detailed setup guide](google-sheets-setup-guide.md) for step-by-step instructions.

## 🎨 Customization

### Styling
The game uses Tailwind CSS for responsive design. You can customize:
- Colors and themes
- Button styles
- Layout and spacing
- Animations and transitions

### Game Mechanics
Easily modify:
- Number of rounds (default: 10)
- Points per correct answer (default: 10)
- Level progression thresholds
- Random choice algorithms

### Data Structure
Add more columns to your Google Sheet:
- Categories
- Difficulty ratings
- Hints or explanations
- Media URLs (images, sounds)

## 🔍 Troubleshooting

### Common Issues

**Game shows "Demo Mode"**
- This is normal if Google Sheets isn't configured
- Follow the setup guide to connect your sheet

**"No data found" error**
- Check your Google Sheet has data starting from row 2
- Verify the range in your configuration

**API connection fails**
- Ensure your API key is valid
- Check that Google Sheets API is enabled
- Verify sheet sharing permissions

### Debug Mode
Open browser console and check for error messages. The game provides detailed logging for troubleshooting.

## 🌟 Advanced Features

### Planned Enhancements
- [ ] Category filtering
- [ ] Difficulty selection
- [ ] Multiplayer support
- [ ] Leaderboards
- [ ] Sound effects
- [ ] Achievement system
- [ ] Data analytics

### Extending the Game
The codebase is designed for easy extension:
- Add new game modes
- Implement different scoring systems
- Create themed word sets
- Add multimedia content

## 📱 Compatibility

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Device Support
- Desktop computers
- Tablets
- Mobile phones (responsive design)

## 🤝 Contributing

Want to improve the game? Here's how:

1. **Add Word Data**: Contribute to the sample database
2. **Report Bugs**: Open issues for any problems found
3. **Suggest Features**: Share ideas for new functionality
4. **Code Improvements**: Submit pull requests for enhancements

## 📄 License

This project is open source and available under the MIT License.

## 🎓 Educational Use

Perfect for:
- **Language Learning**: Vocabulary building
- **Education**: Quiz games for any subject
- **Training**: Corporate training modules
- **Assessment**: Quick knowledge checks

## 📞 Support

Need help? Check these resources:
1. [Setup Guide](google-sheets-setup-guide.md)
2. Browser console for error messages
3. Google Sheets API documentation
4. Community forums and discussions

## 🎉 Get Started

Ready to play? Open `word-game.html` in your browser and start your word game adventure!

---

**Made with ❤️ for educators, gamers, and anyone who loves interactive learning!** 
