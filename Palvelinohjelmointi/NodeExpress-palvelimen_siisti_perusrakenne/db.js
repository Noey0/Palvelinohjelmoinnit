import mysql from "mysql2/promise";
import dbconfig from "./dbconfig.json" with { type: "json" };

const pool = mysql.createPool(dbconfig);

const getConnection = async () => {
  return await pool.getConnection();
};

// ONLY ADMINS LOGIN
const findAdminUser = async (identifier) => {
  const c = await getConnection();

  try {
    const sql = `
      SELECT *
      FROM system_user
      WHERE (id = ? OR email = ?) AND admin = 1
      LIMIT 1
    `;

    const [rows] = await c.execute(sql, [Number(identifier) || 0, identifier]);

    return rows[0] || null;
  } finally {
    c.release();
  }
};

const getFeedback = async () => {
  const c = await getConnection();

  try {
    const sql = `
      SELECT f.*, su.fullname AS user_name
      FROM feedback f
      LEFT JOIN system_user su ON f.from_user = su.id
      ORDER BY f.arrived DESC
    `;

    const [rows] = await c.execute(sql);
    return rows;
  } finally {
    c.release();
  }
};

const getCustomers = async () => {
  const c = await getConnection();

  try {
    const sql = `
      SELECT
        c.name AS company_name,
        su.id AS user_id,
        su.fullname,
        su.email,
        su.admin
      FROM system_user su
      LEFT JOIN customer c ON su.customer_id = c.id
    `;

    const [rows] = await c.execute(sql);
    return rows;
  } finally {
    c.release();
  }
};

const getTickets = async () => {
  const c = await getConnection();

  try {
    const sql = `
      SELECT st.*, c.name AS customer_name, ts.description AS status_text
      FROM support_ticket st
      LEFT JOIN customer c ON st.customer_id = c.id
      LEFT JOIN ticket_status ts ON st.status = ts.id
      ORDER BY st.arrived DESC
    `;

    const [rows] = await c.execute(sql);

    return rows.map((r) => ({
      ...r,
      customer_name: r.customer_name || `Asiakas ID: ${r.customer_id}`,
      status_text: r.status_text || `Tila ID: ${r.status}`,
    }));
  } finally {
    c.release();
  }
};

const getTicketById = async (id) => {
  const c = await getConnection();

  try {
    const sql = `
      SELECT st.*, c.name AS customer_name, ts.description AS status_text
      FROM support_ticket st
      LEFT JOIN customer c ON st.customer_id = c.id
      LEFT JOIN ticket_status ts ON st.status = ts.id
      WHERE st.id = ?
    `;

    const [rows] = await c.execute(sql, [id]);

    if (!rows.length) return null;

    const t = rows[0];

    return {
      ...t,
      customer_name: t.customer_name || `Asiakas ID: ${t.customer_id}`,
      status_text: t.status_text || `Tila ID: ${t.status}`,
    };
  } finally {
    c.release();
  }
};

const getTicketMessages = async (ticketId) => {
  const c = await getConnection();

  try {
    const sql = `
      SELECT sm.*, u.fullname AS sender_name, u.admin
      FROM support_message sm
      LEFT JOIN system_user u ON sm.from_user = u.id
      WHERE sm.ticket_id = ?
      ORDER BY sm.created_at ASC
    `;

    const [rows] = await c.execute(sql, [ticketId]);

    return rows.map((r) => ({
      ...r,
      is_admin: r.admin === 1,
    }));
  } finally {
    c.release();
  }
};

const addTicketMessage = async (ticketId, senderId, content) => {
  const c = await getConnection();

  try {
    await c.execute(
      `
      INSERT INTO support_message (ticket_id, from_user, body, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [ticketId, senderId, content],
    );
  } finally {
    c.release();
  }
};

const updateTicketStatus = async (ticketId, status) => {
  const c = await getConnection();

  try {
    if (Number(status) === 4) {
      await c.execute(
        `
        UPDATE support_ticket
        SET status = ?, handled = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [status, ticketId],
      );
    } else {
      await c.execute(
        `
        UPDATE support_ticket
        SET status = ?, handled = NULL
        WHERE id = ?
        `,
        [status, ticketId],
      );
    }
  } finally {
    c.release();
  }
};

export default {
  findAdminUser,
  getFeedback,
  getCustomers,
  getTickets,
  getTicketById,
  getTicketMessages,
  addTicketMessage,
  updateTicketStatus,
};
