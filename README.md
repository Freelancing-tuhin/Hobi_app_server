# Hobi App - Backend Architecture

## Database Schema (NoSQL - MongoDB)

Although Hobi uses MongoDB (NoSQL), the data architecture is highly structured with clear relational mappings. Using NoSQL allows us to handle dynamic attributes and high-read volumes efficiently without the overhead of heavy joins.

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ BOOKING : "places"
    USER ||--o{ REVIEW : "writes"
    
    ORGANIZER ||--o{ EVENT : "manages"
    ORGANIZER ||--|| WALLET : "owns"
    ORGANIZER ||--o{ TRANSACTION : "receives/sends"
    
    EVENT ||--o{ BOOKING : "has"
    EVENT ||--o{ REVIEW : "receives"
    
    SERVICES ||--o{ EVENT : "category"
    SERVICES ||--o{ ORGANIZER : "category"

    BOOKING ||--o{ TRANSACTION : "generates"
    WALLET ||--o{ TRANSACTION : "logs"

    USER {
        ObjectId _id
        string full_name
        string email
        string phone
        string address
        string gender
        number age
    }

    ORGANIZER {
        ObjectId _id
        string full_name
        string email
        string phone
        ObjectId service_category
        number profit_percentage
        boolean is_verified
        string PAN
        string GST
        object bank_details
    }

    EVENT {
        ObjectId _id
        ObjectId organizerId
        string title
        ObjectId category
        string type "Single/Recurring"
        string startDate
        object location
        array tickets
        boolean verified
    }

    BOOKING {
        ObjectId _id
        ObjectId userId
        ObjectId eventId
        ObjectId ticketId
        number amountPaid
        string paymentStatus
        string booking_status
        string transactionId
    }

    TRANSACTION {
        ObjectId _id
        string type "credit/debit/booking..."
        number amount
        string senderId
        string receiverId
        string bookingId
        string walletId
        string withdrawalStatus
    }

    WALLET {
        ObjectId _id
        string organizerId
        number balance
        number totalEarnings
        number totalWithdrawals
        boolean isActive
    }

    REVIEW {
        ObjectId _id
        ObjectId userId
        ObjectId eventId
        number rating
        string comment
        string review_status
    }

    SERVICES {
        ObjectId _id
        string service_name
        string description
    }
```

### Architectural Rationale

#### 1. Performance (Single Document Fetch)
Storing complex objects like `Event` tickets, inclusions, and location as nested arrays/objects within a single document allows us to fetch everything needed for a UI view in **one query**. This eliminates the 4-5 table joins that would be required in a SQL database, significantly reducing database latency.

#### 2. Schema Flexibility
Our entities (especially Events and Organizers) have varying metadata—different types of licenses, dynamic documentation, and per-activity specific fields. MongoDB’s NoSQL nature handles these variations natively without the need for complex 'Entity-Attribute-Value' (EAV) patterns or sparse columns.

#### 3. Data Integrity with Mongoose
We enforce data integrity and validation through **Mongoose Schemas**. Every relationship (referenced via `ObjectIDs`) is validated at the application level, giving us the reliability of a relational database with the horizontal scaling capabilities of NoSQL.

#### 4. Developer Velocity
The entire stack uses TypeScript. MongoDB’s BSON format aligns perfectly with our front-end and back-end interface requirements, removing the 'Object-Relational Mapping' tax and speeding up feature development.
