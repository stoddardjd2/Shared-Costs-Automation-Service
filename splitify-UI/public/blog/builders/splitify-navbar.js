class SplitifyNavbar extends HTMLElement {
  connectedCallback() {
    const login = this.hasAttribute("login");
    const signup = this.hasAttribute("signup");

    this.innerHTML = `
    <style>
      .navbar {
        position: sticky;
        top: 0;
        z-index: 50;
        background: #ffffff;
        border-bottom: 1px solid #e5e7eb;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        font-family: system-ui, -apple-system, Inter, sans-serif;
      }
      .navbar-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
        display: flex;
        height: 64px;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .navbar-logo {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        font-size: 22px;
        color: #2563eb;
        text-decoration: none;
      }
      .navbar-logo img {
        width: 34px;
        height: 34px;
      }

      .navbar-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 0 0 auto;
      }

      .nav-link {
        font-size: 15px;
        color: #4b5563;
        padding: 8px 12px;
        border-radius: 6px;
        text-decoration: none;
        transition: 0.2s;
      }
      .nav-link:hover {
        background: #f3f4f6;
        color: #111827;
      }

      .button-primary {
        background: #2563eb;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        white-space: nowrap;
        transition: 0.2s;
      }
      .button-primary:hover {
        background: #1d4ed8;
      }

      /* Text switching */
      .text-desktop { display: inline; }
      .text-mobile { display: none; }

      @media (max-width: 768px) {
        .navbar-container {
          height: auto;
          padding-top: 10px;
          padding-bottom: 10px;
        }
        .nav-link,
        .button-primary {
          padding: 8px 12px;
          font-size: 14px;
        }

        /* Swap text */
        .text-desktop { display: none; }
        .text-mobile { display: inline; }
      }

      @media (max-width: 420px) {
        .navbar-container {
          row-gap: 8px;
        }
        .navbar-actions {
        }
      }
    </style>

    <nav class="navbar">
      <div class="navbar-container">
        <a href="/" class="navbar-logo">
          <img src="/SmartSplitLogo.svg" alt="">
          Splitify
        </a>

        <div class="navbar-actions">
          ${login ? `<a href="/login" class="nav-link">Login</a>` : ""}

          ${signup ? `
            <a href="/signup" class="button-primary">
              <span class="text-desktop">Create Your Free Account</span>
              <span class="text-mobile">Sign up</span>
            </a>
          ` : ""}
        </div>
      </div>
    </nav>
    `;
  }
}

customElements.define("splitify-navbar", SplitifyNavbar);
