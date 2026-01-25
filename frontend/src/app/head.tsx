export default function Head() {
  return (
    <>
      {/* Google Analytics */}
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-2DKN72DYLE"></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-2DKN72DYLE');
        `}
      </script>
      <meta property="og:image" content="https://ksevillejo.s3.us-east-005.backblazeb2.com/WorkToolsHub+Logo.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="fb:app_id" content="892769527065148" />
    </>
  );
}
