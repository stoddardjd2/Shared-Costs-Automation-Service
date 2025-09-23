/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "section-gradient": "linear-gradient(180deg, #ACC8D2 0%, #E0EAEE 100%)",
        "section-gradient-reverse":
          "linear-gradient(180deg,#E0EAEE 0%,#ACC8D2 100%)",
        "scroll-gradient":
          "radial-gradient(137.99% 51.6% at 0% 100%, #000000 0%, #075C7B 41.39%, #022B3A 91.02%)",

        "scroll-gradient-mobile":
          "radial-gradient(137.99% 51.6% at 50% 100%,#1f7594 0%, #06455c 60%)",
        // "feature-gradient": "radial-gradient(137.99% 51.6% at 50% 100%, #ACACAC 0%, #075C7B 41.39%, #022B3A 71.02%, #0C0C0C 100%)"
        /* Rectangle 6 */
        "feature-gradient":
          "radial-gradient(145.7% 65.94% at 4.59% 90.45%, #022B3A 79.33%, #0C0C0C 100%)",
        "cta-gradient":
          "radial-gradient(71.54% 87.4% at 47.99% 100%, #ACACAC 0%, #075C7B 41.39%, #022B3A 71.02%, #0C0C0C 100%)",
      } /* Rectangle 7 */,
      /* Rectangle 6 */
      backgroundColor: {
        "landing-main": "#ffffff",
        /* Desktop - 11 */
      },
      borderRadius: {
        banner: "40px 40px 0 0",
      },
    },
    screens: {
      xxs: "380px",
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
};
/* Experience the Relief. */
