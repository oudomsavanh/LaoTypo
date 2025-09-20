import UIKit
import WebKit

class ViewController: UIViewController {
    
    @IBOutlet weak var webView: WKWebView!
    private var webViewBridge: WebViewBridge!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        setupWebViewBridge()
        loadWebApp()
    }
    
    private func setupWebView() {
        // Configure WKWebView
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        // Create WKWebView if not connected via storyboard
        if webView == nil {
            webView = WKWebView(frame: view.bounds, configuration: configuration)
            webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            view.addSubview(webView)
        }
        
        // Configure web view
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.bounces = false
        webView.scrollView.showsVerticalScrollIndicator = false
        webView.scrollView.showsHorizontalScrollIndicator = false
    }
    
    private func setupWebViewBridge() {
        webViewBridge = WebViewBridge(webView: webView)
        webViewBridge.delegate = self
    }
    
    private func loadWebApp() {
        // Load the LaoTypo web app
        if let url = URL(string: "https://laotypo.com/start.html") {
            let request = URLRequest(url: url)
            webView.load(request)
        }
    }
}

// MARK: - WKNavigationDelegate
extension ViewController: WKNavigationDelegate {
    
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        // Show loading indicator if needed
        print("Started loading web app")
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // Hide loading indicator if needed
        print("Finished loading web app")
        
        // Inject native app detection script
        webViewBridge.injectNativeAppDetection()
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("Failed to load web app: \(error.localizedDescription)")
    }
}

// MARK: - WKUIDelegate
extension ViewController: WKUIDelegate {
    
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        // Handle new window requests (like popups)
        if navigationAction.targetFrame == nil {
            webView.load(navigationAction.request)
        }
        return nil
    }
}

// MARK: - WebViewBridgeDelegate
extension ViewController: WebViewBridgeDelegate {
    
    func webViewBridge(_ bridge: WebViewBridge, didReceiveSaveToPhotosRequest imageData: String, fileName: String) {
        // Handle save to photos request from web app
        webViewBridge.saveImageToPhotos(imageData: imageData, fileName: fileName)
    }
    
    func webViewBridge(_ bridge: WebViewBridge, didCompleteSaveToPhotos success: Bool, message: String) {
        // Handle save completion
        DispatchQueue.main.async {
            if success {
                self.showAlert(title: "Success", message: message)
            } else {
                self.showAlert(title: "Error", message: message)
            }
        }
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}