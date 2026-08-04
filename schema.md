digraph RelationalSchema {
    graph [
        rankdir=LR,
        bgcolor="white",
        splines=true,
        nodesep=0.45,
        ranksep=0.95,
        newrank=true,
        fontname="Arial",
        fontsize=18,
        label="Relational Schema Diagram",
        labelloc="t"
    ];

    node [shape=plaintext, fontname="Arial", fontsize=12];
    edge [fontname="Arial", fontsize=9, color="#444444", arrowhead=normal, arrowsize=0.85];

    LEGEND [
        shape=plaintext,
        label="Arrow direction: Foreign Key points to referenced Primary Key"
    ];

    /* =========================================================
       USERS AND ROLE SUBTYPES
    ========================================================= */
    subgraph cluster_users {
        label="Users / Roles";
        color="#999999";

        USERS [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#dbeafe"><B>USERS</B></TD></TR>
                <TR><TD PORT="id" ALIGN="LEFT">id PK</TD></TR>
                <TR><TD PORT="email" ALIGN="LEFT">email</TD></TR>
                <TR><TD PORT="full_name" ALIGN="LEFT">full_name</TD></TR>
                <TR><TD PORT="password_hash" ALIGN="LEFT">password_hash</TD></TR>
                <TR><TD PORT="role" ALIGN="LEFT">role</TD></TR>
            </TABLE>
        >];

        ADMIN [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#e2e8f0"><B>ADMIN</B></TD></TR>
                <TR><TD PORT="user_id" ALIGN="LEFT">user_id PK/FK</TD></TR>
            </TABLE>
        >];

        ORGANIZER [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#e2e8f0"><B>ORGANIZER</B></TD></TR>
                <TR><TD PORT="user_id" ALIGN="LEFT">user_id PK/FK</TD></TR>
            </TABLE>
        >];

        PARTICIPANT [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#e2e8f0"><B>PARTICIPANT</B></TD></TR>
                <TR><TD PORT="user_id" ALIGN="LEFT">user_id PK/FK</TD></TR>
            </TABLE>
        >];

        JUDGE [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#e2e8f0"><B>JUDGE</B></TD></TR>
                <TR><TD PORT="user_id" ALIGN="LEFT">user_id PK/FK</TD></TR>
            </TABLE>
        >];

        VOLUNTEER [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#e2e8f0"><B>VOLUNTEER</B></TD></TR>
                <TR><TD PORT="user_id" ALIGN="LEFT">user_id PK/FK</TD></TR>
            </TABLE>
        >];
    }

    /* =========================================================
       TEAM / PROJECT / SUBMISSION / JUDGING
    ========================================================= */
    subgraph cluster_projects {
        label="Teams / Projects / Judging";
        color="#999999";

        TEAM [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#dcfce7"><B>TEAM</B></TD></TR>
                <TR><TD PORT="team_id" ALIGN="LEFT">team_id PK</TD></TR>
                <TR><TD PORT="name" ALIGN="LEFT">name</TD></TR>
            </TABLE>
        >];

        TEAM_MEMBER [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#f0fdf4"><B>TEAM_MEMBER</B></TD></TR>
                <TR><TD PORT="team_id" ALIGN="LEFT">team_id PK/FK</TD></TR>
                <TR><TD PORT="participant_id" ALIGN="LEFT">participant_id PK/FK</TD></TR>
            </TABLE>
        >];

        PROJECT [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#dcfce7"><B>PROJECT</B></TD></TR>
                <TR><TD PORT="project_id" ALIGN="LEFT">project_id PK</TD></TR>
                <TR><TD PORT="title" ALIGN="LEFT">title</TD></TR>
                <TR><TD PORT="team_id" ALIGN="LEFT">team_id FK UNIQUE</TD></TR>
            </TABLE>
        >];

        SUBMISSION [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#dcfce7"><B>SUBMISSION</B></TD></TR>
                <TR><TD PORT="submission_id" ALIGN="LEFT">submission_id PK</TD></TR>
                <TR><TD PORT="repo_url" ALIGN="LEFT">repo_url</TD></TR>
                <TR><TD PORT="project_id" ALIGN="LEFT">project_id FK UNIQUE</TD></TR>
            </TABLE>
        >];

        SCORE [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#f0fdf4"><B>SCORE</B></TD></TR>
                <TR><TD PORT="judge_id" ALIGN="LEFT">judge_id PK/FK</TD></TR>
                <TR><TD PORT="submission_id" ALIGN="LEFT">submission_id PK/FK</TD></TR>
                <TR><TD PORT="points" ALIGN="LEFT">points</TD></TR>
            </TABLE>
        >];
    }

    /* =========================================================
       SESSIONS AND CHECK-IN
    ========================================================= */
    subgraph cluster_schedule {
        label="Sessions / Check-in";
        color="#999999";

        SESSION [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#fef9c3"><B>SESSION</B></TD></TR>
                <TR><TD PORT="session_id" ALIGN="LEFT">session_id PK</TD></TR>
                <TR><TD PORT="title" ALIGN="LEFT">title</TD></TR>
                <TR><TD PORT="start_at" ALIGN="LEFT">start_at</TD></TR>
                <TR><TD PORT="organizer_id" ALIGN="LEFT">organizer_id FK</TD></TR>
            </TABLE>
        >];

        CHECKIN [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#fefce8"><B>CHECKIN</B></TD></TR>
                <TR><TD PORT="checkin_id" ALIGN="LEFT">checkin_id PK</TD></TR>
                <TR><TD PORT="participant_id" ALIGN="LEFT">participant_id FK</TD></TR>
                <TR><TD PORT="session_id" ALIGN="LEFT">session_id FK</TD></TR>
                <TR><TD PORT="method" ALIGN="LEFT">method</TD></TR>
            </TABLE>
        >];
    }

    /* =========================================================
       INVENTORY AND CHECKOUT
    ========================================================= */
    subgraph cluster_inventory {
        label="Inventory / Checkout";
        color="#999999";

        INVENTORY_ITEM [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#ffe4e6"><B>INVENTORY_ITEM</B></TD></TR>
                <TR><TD PORT="item_id" ALIGN="LEFT">item_id PK</TD></TR>
                <TR><TD PORT="name" ALIGN="LEFT">name</TD></TR>
                <TR><TD PORT="quantity_available" ALIGN="LEFT">quantity_available</TD></TR>
                <TR><TD PORT="organizer_id" ALIGN="LEFT">organizer_id FK</TD></TR>
            </TABLE>
        >];

        CHECKOUT [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#fff1f2"><B>CHECKOUT</B></TD></TR>
                <TR><TD PORT="checkout_id" ALIGN="LEFT">checkout_id PK</TD></TR>
                <TR><TD PORT="participant_id" ALIGN="LEFT">participant_id FK</TD></TR>
                <TR><TD PORT="item_id" ALIGN="LEFT">item_id FK</TD></TR>
                <TR><TD PORT="due_at" ALIGN="LEFT">due_at</TD></TR>
            </TABLE>
        >];
    }

    /* =========================================================
       VENUE AND BOOKING
    ========================================================= */
    subgraph cluster_venue {
        label="Venue / Booking";
        color="#999999";

        VENUE_AREA [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#e0f2fe"><B>VENUE_AREA</B></TD></TR>
                <TR><TD PORT="area_id" ALIGN="LEFT">area_id PK</TD></TR>
                <TR><TD PORT="name" ALIGN="LEFT">name</TD></TR>
            </TABLE>
        >];

        BOOKING [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#f0f9ff"><B>BOOKING</B></TD></TR>
                <TR><TD PORT="booking_id" ALIGN="LEFT">booking_id PK</TD></TR>
                <TR><TD PORT="team_id" ALIGN="LEFT">team_id FK</TD></TR>
                <TR><TD PORT="area_id" ALIGN="LEFT">area_id FK</TD></TR>
                <TR><TD PORT="organizer_id" ALIGN="LEFT">organizer_id FK</TD></TR>
                <TR><TD PORT="start_at" ALIGN="LEFT">start_at</TD></TR>
            </TABLE>
        >];
    }

    /* =========================================================
       SPONSORS, CONTRIBUTIONS, EXPENSES
    ========================================================= */
    subgraph cluster_finance {
        label="Budget / Sponsorship";
        color="#999999";

        SPONSOR [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#ede9fe"><B>SPONSOR</B></TD></TR>
                <TR><TD PORT="sponsor_id" ALIGN="LEFT">sponsor_id PK</TD></TR>
                <TR><TD PORT="name" ALIGN="LEFT">name</TD></TR>
            </TABLE>
        >];

        CONTRIBUTION [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#f5f3ff"><B>CONTRIBUTION</B></TD></TR>
                <TR><TD PORT="contribution_id" ALIGN="LEFT">contribution_id PK</TD></TR>
                <TR><TD PORT="sponsor_id" ALIGN="LEFT">sponsor_id FK</TD></TR>
                <TR><TD PORT="amount" ALIGN="LEFT">amount</TD></TR>
            </TABLE>
        >];

        EXPENSE [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#f5f3ff"><B>EXPENSE</B></TD></TR>
                <TR><TD PORT="expense_id" ALIGN="LEFT">expense_id PK</TD></TR>
                <TR><TD PORT="organizer_id" ALIGN="LEFT">organizer_id FK</TD></TR>
                <TR><TD PORT="amount" ALIGN="LEFT">amount</TD></TR>
            </TABLE>
        >];
    }

    /* =========================================================
       CERTIFICATES, VOLUNTEER SHIFTS, INCIDENTS
    ========================================================= */
    subgraph cluster_other {
        label="Certificates / Volunteers / Incidents";
        color="#999999";

        CERTIFICATE [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#fce7f3"><B>CERTIFICATE</B></TD></TR>
                <TR><TD PORT="certificate_id" ALIGN="LEFT">certificate_id PK</TD></TR>
                <TR><TD PORT="participant_id" ALIGN="LEFT">participant_id FK</TD></TR>
                <TR><TD PORT="verification_code" ALIGN="LEFT">verification_code</TD></TR>
            </TABLE>
        >];

        VOLUNTEER_SHIFT [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#ffedd5"><B>VOLUNTEER_SHIFT</B></TD></TR>
                <TR><TD PORT="shift_id" ALIGN="LEFT">shift_id PK</TD></TR>
                <TR><TD PORT="capacity" ALIGN="LEFT">capacity</TD></TR>
            </TABLE>
        >];

        SHIFT_ASSIGNMENT [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#fff7ed"><B>SHIFT_ASSIGNMENT</B></TD></TR>
                <TR><TD PORT="volunteer_id" ALIGN="LEFT">volunteer_id PK/FK</TD></TR>
                <TR><TD PORT="shift_id" ALIGN="LEFT">shift_id PK/FK</TD></TR>
                <TR><TD PORT="status" ALIGN="LEFT">status</TD></TR>
            </TABLE>
        >];

        INCIDENT [label=<
            <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0">
                <TR><TD PORT="hdr" BGCOLOR="#fee2e2"><B>INCIDENT</B></TD></TR>
                <TR><TD PORT="incident_id" ALIGN="LEFT">incident_id PK</TD></TR>
                <TR><TD PORT="reported_by" ALIGN="LEFT">reported_by FK</TD></TR>
                <TR><TD PORT="severity" ALIGN="LEFT">severity</TD></TR>
            </TABLE>
        >];
    }

    /* =========================================================
       FOREIGN KEY RELATIONSHIPS
       Arrow direction: FK -> PK
    ========================================================= */

    /* User subtype relationships */
    ADMIN:user_id -> USERS:id [label="1:1"];
    ORGANIZER:user_id -> USERS:id [label="1:1"];
    PARTICIPANT:user_id -> USERS:id [label="1:1"];
    JUDGE:user_id -> USERS:id [label="1:1"];
    VOLUNTEER:user_id -> USERS:id [label="1:1"];

    /* Team membership */
    TEAM_MEMBER:team_id -> TEAM:team_id;
    TEAM_MEMBER:participant_id -> PARTICIPANT:user_id;

    /* Project and submission */
    PROJECT:team_id -> TEAM:team_id [label="1:1"];
    SUBMISSION:project_id -> PROJECT:project_id [label="1:1"];

    /* Judging scores */
    SCORE:judge_id -> JUDGE:user_id;
    SCORE:submission_id -> SUBMISSION:submission_id;

    /* Sessions and check-in */
    SESSION:organizer_id -> ORGANIZER:user_id;
    CHECKIN:participant_id -> PARTICIPANT:user_id;
    CHECKIN:session_id -> SESSION:session_id;

    /* Inventory and checkout */
    INVENTORY_ITEM:organizer_id -> ORGANIZER:user_id;
    CHECKOUT:participant_id -> PARTICIPANT:user_id;
    CHECKOUT:item_id -> INVENTORY_ITEM:item_id;

    /* Venue booking */
    BOOKING:team_id -> TEAM:team_id;
    BOOKING:area_id -> VENUE_AREA:area_id;
    BOOKING:organizer_id -> ORGANIZER:user_id;

    /* Sponsorship and expenses */
    CONTRIBUTION:sponsor_id -> SPONSOR:sponsor_id;
    EXPENSE:organizer_id -> ORGANIZER:user_id;

    /* Certificates */
    CERTIFICATE:participant_id -> PARTICIPANT:user_id;

    /* Volunteer shifts */
    SHIFT_ASSIGNMENT:volunteer_id -> VOLUNTEER:user_id;
    SHIFT_ASSIGNMENT:shift_id -> VOLUNTEER_SHIFT:shift_id;

    /* Incidents */
    INCIDENT:reported_by -> USERS:id;
}


# https://edotor.net/