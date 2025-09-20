import UIKit
import WebKit
import Photos

protocol WebViewBridgeDelegate: AnyObject {
    func webViewBridge(_ bridge: WebViewBridge, didReceiveSaveToPhotosRequest imageData: String, fileName: String)
    func webViewBridge(_ bridge: WebViewBridge, didCompleteSaveToPhotos success: Bool, message: String)
}

class WebViewBridge: NSObject {
    
    weak var webView: WKWebView?
    weak var delegate: WebViewBridgeDelegate?
    
    init(webView: WKWebView) {
        super.init()
        self.webView = webView
        setupMessageHandlers()
    }
    
    private func setupMessageHandlers() {
        guard let webView = webView else { return }
        
        // Add message handler for save to photos
        webView.configuration.userContentController.add(self, name: "saveToPhotos")
        
        // Add message handler for native app detection
        webView.configuration.userContentController.add(self, name: "isNativeApp")
    }
    
    func saveImageToPhotos(imageData: String, fileName: String) {
        // Convert base64 string to UIImage
        guard let data = Data(base64Encoded: imageData.replacingOccurrences(of: "data:image/png;base64,", with: "")),
              let image = UIImage(data: data) else {
            delegate?.webViewBridge(self, didCompleteSaveToPhotos: false, message: "Failed to process image data")
            return
        }
        
        // Request photo library permission
        PHPhotoLibrary.requestAuthorization { [weak self] status in
            DispatchQueue.main.async {
                switch status {
                case .authorized, .limited:
                    self?.performSaveToPhotos(image: image, fileName: fileName)
                case .denied, .restricted:
                    self?.delegate?.webViewBridge(self!, didCompleteSaveToPhotos: false, message: "Photo library access denied")
                case .notDetermined:
                    self?.delegate?.webViewBridge(self!, didCompleteSaveToPhotos: false, message: "Photo library permission not determined")
                @unknown default:
                    self?.delegate?.webViewBridge(self!, didCompleteSaveToPhotos: false, message: "Unknown photo library permission status")
                }
            }
        }
    }
    
    private func performSaveToPhotos(image: UIImage, fileName: String) {
        UIImageWriteToSavedPhotosAlbum(image, self, #selector(image(_:didFinishSavingWithError:contextInfo:)), nil)
    }
    
    @objc private func image(_ image: UIImage, didFinishSavingWithError error: Error?, contextInfo: UnsafeRawPointer) {
        if let error = error {
            delegate?.webViewBridge(self, didCompleteSaveToPhotos: false, message: "Failed to save image: \(error.localizedDescription)")
        } else {
            delegate?.webViewBridge(self, didCompleteSaveToPhotos: true, message: "Image saved to Photos successfully!")
        }
    }
    
    func injectNativeAppDetection() {
        let script = """
        window.isNativeApp = true;
        window.nativeAppVersion = "1.0.0";
        console.log('Native iOS app detected');
        """
        
        webView?.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("Failed to inject native app detection: \(error)")
            } else {
                print("Native app detection injected successfully")
            }
        }
    }
}

// MARK: - WKScriptMessageHandler
extension WebViewBridge: WKScriptMessageHandler {
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.name {
        case "saveToPhotos":
            handleSaveToPhotosMessage(message)
        case "isNativeApp":
            handleIsNativeAppMessage(message)
        default:
            print("Unknown message received: \(message.name)")
        }
    }
    
    private func handleSaveToPhotosMessage(_ message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let imageData = body["imageData"] as? String,
              let fileName = body["fileName"] as? String else {
            print("Invalid save to photos message format")
            return
        }
        
        delegate?.webViewBridge(self, didReceiveSaveToPhotosRequest: imageData, fileName: fileName)
    }
    
    private func handleIsNativeAppMessage(_ message: WKScriptMessage) {
        // Respond to web app's request to check if running in native app
        let response = """
        if (window.nativeAppCallback) {
            window.nativeAppCallback(true);
        }
        """
        
        webView?.evaluateJavaScript(response) { result, error in
            if let error = error {
                print("Failed to respond to native app check: \(error)")
            }
        }
    }
}