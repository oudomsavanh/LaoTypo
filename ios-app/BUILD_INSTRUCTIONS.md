# LaoTypo iOS App - Build Instructions

## Prerequisites

- **macOS** with Xcode 15.0 or later
- **Apple Developer Account** (for device testing and App Store deployment)
- **iOS Device** or **Simulator** for testing

## Step-by-Step Build Process

### 1. Open Project in Xcode

```bash
cd /workspace/ios-app
open LaoTypo.xcodeproj
```

### 2. Configure Project Settings

1. **Select Project**: Click on "LaoTypo" in the project navigator
2. **General Tab**:
   - **Display Name**: LaoTypo
   - **Bundle Identifier**: `com.laotypo.app` (or your own)
   - **Version**: 1.0
   - **Build**: 1
   - **Deployment Target**: iOS 15.0

3. **Signing & Capabilities**:
   - **Team**: Select your Apple Developer Team
   - **Signing Certificate**: Automatic or Manual
   - **Bundle Identifier**: Must be unique

### 3. Add App Icon

1. **Open Assets.xcassets**
2. **Select AppIcon**
3. **Add Icon Images**:
   - Drag your app icon images to the appropriate slots
   - Required sizes: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024
   - Use the LaoTypo logo for consistency

### 4. Configure Info.plist

The `Info.plist` is already configured with:
- Photo Library usage description
- Supported orientations
- Launch screen configuration

### 5. Build and Test

#### For Simulator:
1. **Select Simulator**: Choose iPhone 15 Pro or similar
2. **Build**: Press `Cmd + B` or click Build button
3. **Run**: Press `Cmd + R` or click Run button

#### For Device:
1. **Connect iOS Device** via USB
2. **Select Device**: Choose your connected device
3. **Trust Computer**: On device, trust the computer if prompted
4. **Build and Run**: Press `Cmd + R`

### 6. Test Functionality

1. **Launch App**: Should load the LaoTypo web game
2. **Play Game**: Complete a game to reach the results screen
3. **Test Save**: Click "ບັນທຶກໃສ່ Photos" button
4. **Verify**: Check Photos app for saved image

## Troubleshooting

### Common Issues

#### 1. Build Errors
- **Solution**: Check Xcode version compatibility
- **Solution**: Clean build folder (`Cmd + Shift + K`)
- **Solution**: Restart Xcode

#### 2. Signing Issues
- **Solution**: Select correct development team
- **Solution**: Check bundle identifier uniqueness
- **Solution**: Verify Apple Developer account status

#### 3. Photo Library Permission
- **Solution**: Check Info.plist has `NSPhotoLibraryAddUsageDescription`
- **Solution**: Test on physical device (simulator may not show permission dialog)

#### 4. Web App Not Loading
- **Solution**: Check internet connection
- **Solution**: Verify URL in ViewController.swift
- **Solution**: Check web app is accessible

#### 5. Bridge Communication Issues
- **Solution**: Check console logs in Xcode
- **Solution**: Verify message handler registration
- **Solution**: Test JavaScript bridge detection

### Debug Console

Monitor these logs:
- **Swift**: Xcode console output
- **JavaScript**: Safari Web Inspector (if accessible)
- **Bridge**: Message handler communication

## Deployment Options

### 1. TestFlight (Recommended for Testing)

1. **Archive**: Product → Archive
2. **Upload**: Distribute App → App Store Connect
3. **TestFlight**: Add testers and distribute

### 2. App Store

1. **Archive**: Product → Archive
2. **Upload**: Distribute App → App Store Connect
3. **App Store Connect**: Configure metadata and submit for review

### 3. Ad Hoc Distribution

1. **Archive**: Product → Archive
2. **Export**: Distribute App → Ad Hoc
3. **Install**: Install on registered devices

## Configuration Files

### Key Files to Review:

- `Info.plist`: App configuration and permissions
- `ViewController.swift`: Main app logic
- `WebViewBridge.swift`: JavaScript bridge
- `project.pbxproj`: Xcode project configuration

### Customization Options:

- **App Icon**: Replace in Assets.xcassets
- **Launch Screen**: Modify LaunchScreen.storyboard
- **Web App URL**: Change in ViewController.swift
- **Bundle ID**: Update in project settings

## Performance Optimization

### WebView Configuration:
- Enable hardware acceleration
- Configure media playback settings
- Optimize for mobile performance

### Memory Management:
- Monitor WebView memory usage
- Handle image data efficiently
- Clean up resources properly

## Security Considerations

- **HTTPS**: Ensure web app uses HTTPS
- **Content Security**: Validate JavaScript messages
- **Permissions**: Request only necessary permissions
- **Data Handling**: Secure image data processing

## Support

For build issues:
1. Check Xcode console for errors
2. Verify all prerequisites are met
3. Test on different devices/simulators
4. Review Apple Developer documentation

## Next Steps

After successful build:
1. Test all functionality thoroughly
2. Prepare App Store metadata
3. Create app screenshots
4. Submit for App Store review