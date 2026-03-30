# Network Diagram (Conceptual) - Secure Payment Integration (VERSA-US-005)

This conceptual network diagram illustrates the architecture of the Secure Payment Integration (VERSA-US-005), highlighting the flow of data and the segregation of environments to meet PCI-DSS requirements. The primary goal is to demonstrate how cardholder data is protected and never directly enters our internal network.

```mermaid
graph LR
    A[Customer Browser] -- HTTPS/TLS --> B{PCI-Compliant Tokenization Service}
    B -- Token --> C[Our Web Application/API]
    C -- HTTPS/TLS (Token) --> D[Payment Gateway]
    D -- Response --> C
    C -- HTTPS/TLS (Other Data) --> E[Internal Application Servers]
    E -- Encrypted Connection --> F[Database (Non-Sensitive Data)]
    subgraph PCI DSS Scope
        B
        D
    end
    subgraph Our Secure Zone
        C
        E
        F
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#ccf,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#ccf,stroke:#333,stroke-width:2px
    style F fill:#cfc,stroke:#333,stroke-width:2px
    linkStyle 0 stroke:#0f0,stroke-width:2px,fill:none;
    linkStyle 1 stroke:#00f,stroke-width:2px,fill:none;
    linkStyle 2 stroke:#0f0,stroke-width:2px,fill:none;
    linkStyle 3 stroke:#00f,stroke-width:2px,fill:none;
    linkStyle 4 stroke:#0f0,stroke-width:2px,fill:none;
```

## Description of Components:

*   **Customer Browser:** The end-user's web browser from which payment information is initiated.
*   **PCI-Compliant Tokenization Service:** A third-party service (e.g., Stripe, Braintree) that directly receives raw cardholder data, tokenizes it, and returns a unique token. This component is within the PCI-DSS scope.
*   **Our Web Application/API:** Our front-end and back-end services that interact with the tokenization service and the payment gateway using tokens. It never handles raw cardholder data.
*   **Payment Gateway:** A third-party service that processes payment transactions using the tokens provided by our application. This component is also within the PCI-DSS scope.
*   **Internal Application Servers:** Our application servers that handle business logic and interact with the database, but not directly with raw cardholder data.
*   **Database (Non-Sensitive Data):** Stores non-sensitive customer and transaction data, including the generated tokens. All data at rest is encrypted.

## Data Flow:

1.  The customer enters card details into a form served by our application but directly submitted to the Tokenization Service via HTTPS/TLS.
2.  The Tokenization Service generates a token and returns it to our Web Application/API.
3.  Our Web Application/API uses this token to initiate a transaction with the Payment Gateway via HTTPS/TLS.
4.  The Payment Gateway processes the transaction and returns a response to our Web Application/API.
5.  Our Web Application/API updates internal records (non-sensitive data and token) in the Database via Internal Application Servers, all utilizing encrypted connections.

This architecture ensures a clear separation of concerns, with sensitive cardholder data isolated within PCI-DSS compliant third-party environments.