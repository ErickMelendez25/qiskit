export const Card = ({ children }) => (
    <div style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      {children}
    </div>
  );
  
  export const CardContent = ({ children }) => (
    <div style={{ paddingTop: "8px" }}>
      {children}
    </div>
  );
  