digraph EER {
    graph [rankdir=TB, nodesep=0.35, ranksep=0.8, bgcolor="white"];
    node [fontname="Arial", fontsize=12];
    edge [fontname="Arial", fontsize=10, dir=none];

    /* ================= SUPERTYPE + SUBTYPES ================= */
/* ================= SUPERTYPE + SUBTYPES ================= */
USERS [shape=box, style=bold, label="USERS"];
u_id [shape=ellipse, label="id (PK)"];
u_email [shape=ellipse, label="email"];
u_name [shape=ellipse, label="full_name"];
u_pass [shape=ellipse, label="password_hash"];
u_role [shape=ellipse, label="role"];
USERS -> u_id;
USERS -> u_email;
USERS -> u_name;
USERS -> u_pass;
USERS -> u_role;

/* Use d = disjoint, o = overlapping. Choose only one. */
SPEC [shape=circle, label="d", width=0.45, height=0.45, fixedsize=true];
USERS -> SPEC [penwidth=4, label="total"];

ADMIN [shape=box];
ORGANIZER [shape=box];
PARTICIPANT [shape=box];
JUDGE [shape=box];
VOLUNTEER [shape=box];

SPEC -> ADMIN;
SPEC -> ORGANIZER;
SPEC -> PARTICIPANT;
SPEC -> JUDGE;
SPEC -> VOLUNTEER;

    /* ================= TEAM FORMATION ================= */
    TEAM [shape=box];
    t_id [shape=ellipse, label="team_id (PK)"]; t_name [shape=ellipse, label="name"];
    TEAM -> t_id; TEAM -> t_name;

    forms [shape=diamond, label="forms"];
    PARTICIPANT -> forms [label="M"];
    forms -> TEAM [label="N", penwidth=3];

    /* ================= PROJECT / SUBMISSION / JUDGING ================= */
    PROJECT [shape=box];
    p_id [shape=ellipse, label="project_id (PK)"]; p_title [shape=ellipse, label="title"];
    PROJECT -> p_id; PROJECT -> p_title;

    owns [shape=diamond, label="owns"];
    TEAM -> owns [label="1"]; owns -> PROJECT [label="1"];

    SUBMISSION [shape=box];
    s_id [shape=ellipse, label="submission_id (PK)"]; s_repo [shape=ellipse, label="repo_url"];
    SUBMISSION -> s_id; SUBMISSION -> s_repo;

    submits [shape=diamond, label="submits"];
    PROJECT -> submits [label="1"]; submits -> SUBMISSION [label="1"];

    scores [shape=diamond, label="scores"];
    JUDGE -> scores [label="M"]; scores -> SUBMISSION [label="N"];

    /* ================= SCHEDULE / CHECK-IN ================= */
    SESSION [shape=box];
    se_id [shape=ellipse, label="session_id (PK)"]; se_title [shape=ellipse, label="title"];
    se_time [shape=ellipse, label="start_at"];
    SESSION -> se_id; SESSION -> se_title; SESSION -> se_time;

    manages1 [shape=diamond, label="manages"];
    ORGANIZER -> manages1 [label="1"]; manages1 -> SESSION [label="N"];

    CHECKIN [shape=box];
    c_id [shape=ellipse, label="checkin_id (PK)"]; c_method [shape=ellipse, label="method"];
    CHECKIN -> c_id; CHECKIN -> c_method;

    attends [shape=diamond, label="attends"];
    PARTICIPANT -> attends [label="M"]; attends -> SESSION [label="N"];
    attends -> CHECKIN [style=dashed, label="associative"];

    /* ================= INVENTORY ================= */
    ITEM [shape=box, label="INVENTORY_ITEM"];
    i_id [shape=ellipse, label="item_id (PK)"]; i_name [shape=ellipse, label="name"];
    i_qty [shape=ellipse, label="quantity_available"];
    ITEM -> i_id; ITEM -> i_name; ITEM -> i_qty;

    manages2 [shape=diamond, label="manages"];
    ORGANIZER -> manages2 [label="1"]; manages2 -> ITEM [label="N"];

    CHECKOUT [shape=box];
    co_id [shape=ellipse, label="checkout_id (PK)"]; co_due [shape=ellipse, label="due_at"];
    CHECKOUT -> co_id; CHECKOUT -> co_due;

    borrows [shape=diamond, label="borrows"];
    PARTICIPANT -> borrows [label="M"]; borrows -> ITEM [label="N"];
    borrows -> CHECKOUT [style=dashed, label="associative"];

    /* ================= VENUE / BOOKING ================= */
    VENUE [shape=box, label="VENUE_AREA"];
    v_id [shape=ellipse, label="area_id (PK)"]; v_name [shape=ellipse, label="name"];
    VENUE -> v_id; VENUE -> v_name;

    BOOKING [shape=box];
    b_id [shape=ellipse, label="booking_id (PK)"]; b_time [shape=ellipse, label="start_at"];
    BOOKING -> b_id; BOOKING -> b_time;

    assigns [shape=diamond, label="assigns"];
    ORGANIZER -> assigns [label="1"]; assigns -> BOOKING [label="N"];

    occupies [shape=diamond, label="occupies"];
    TEAM -> occupies [label="M"]; occupies -> VENUE [label="N"];
    occupies -> BOOKING [style=dashed, label="associative"];

    /* ================= BUDGET / SPONSORSHIP ================= */
    SPONSOR [shape=box];
    sp_id [shape=ellipse, label="sponsor_id (PK)"]; sp_name [shape=ellipse, label="name"];
    SPONSOR -> sp_id; SPONSOR -> sp_name;

    CONTRIBUTION [shape=box];
    ct_id [shape=ellipse, label="contribution_id (PK)"]; ct_amt [shape=ellipse, label="amount"];
    CONTRIBUTION -> ct_id; CONTRIBUTION -> ct_amt;

    provides [shape=diamond, label="provides"];
    SPONSOR -> provides [label="1"]; provides -> CONTRIBUTION [label="N", penwidth=3];

    EXPENSE [shape=box];
    e_id [shape=ellipse, label="expense_id (PK)"]; e_amt [shape=ellipse, label="amount"];
    EXPENSE -> e_id; EXPENSE -> e_amt;

    records [shape=diamond, label="records"];
    ORGANIZER -> records [label="1"]; records -> EXPENSE [label="N"];

    /* ================= CERTIFICATES ================= */
    CERT [shape=box, label="CERTIFICATE"];
    ce_id [shape=ellipse, label="certificate_id (PK)"]; ce_code [shape=ellipse, label="verification_code"];
    CERT -> ce_id; CERT -> ce_code;

    receives [shape=diamond, label="receives"];
    PARTICIPANT -> receives [label="1"]; receives -> CERT [label="N", penwidth=3];

    /* ================= VOLUNTEERS ================= */
    SHIFT [shape=box, label="VOLUNTEER_SHIFT"];
    sh_id [shape=ellipse, label="shift_id (PK)"]; sh_cap [shape=ellipse, label="capacity"];
    SHIFT -> sh_id; SHIFT -> sh_cap;

    SHIFTASSIGN [shape=box, label="SHIFT_ASSIGNMENT"];
    sa_status [shape=ellipse, label="status"];
    SHIFTASSIGN -> sa_status;

    works [shape=diamond, label="works"];
    VOLUNTEER -> works [label="M"]; works -> SHIFT [label="N"];
    works -> SHIFTASSIGN [style=dashed, label="associative"];

    /* ================= INCIDENTS ================= */
    INCIDENT [shape=box];
    in_id [shape=ellipse, label="incident_id (PK)"]; in_sev [shape=ellipse, label="severity"];
    INCIDENT -> in_id; INCIDENT -> in_sev;

    reports [shape=diamond, label="reports"];
    USERS -> reports [label="1"]; reports -> INCIDENT [label="N"];
}