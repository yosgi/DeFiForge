// app/500/page.tsx
export default function Custom500Page() {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          background: "#222",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>500 - Server Error</h1>
        <p style={{ fontSize: "18px" }}>Sorry, something went wrong on our end.</p>
      </div>
    );
  }
  