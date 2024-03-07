import UIKit
import Capacitor

class MyViewController: CAPBridgeViewController {
    override func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        // Customize the configuration
        configuration.websiteDataStore = WKWebsiteDataStore.default()

        // Call the super implementation with the customized configuration
        return super.webView(with: frame, configuration: configuration)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        webView!.allowsBackForwardNavigationGestures = true

        // Create a UIRefreshControl
        let refreshControl = UIRefreshControl()
        refreshControl.backgroundColor = .clear
        refreshControl.addTarget(self, action: #selector(refreshWebView(_:)), for: .valueChanged)

        // Add the UIRefreshControl to the WKWebView's scrollView
        webView?.scrollView.addSubview(refreshControl)
        webView?.scrollView.bounces = true
    }

    @objc func refreshWebView(_ sender: UIRefreshControl) {
        webView?.reload()
        sender.endRefreshing()
    }
}
