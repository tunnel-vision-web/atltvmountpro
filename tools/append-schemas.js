import fs from 'node:fs';

const newCollections = [
  {
    "id": "pbc_escrow_ledger",
    "name": "escrow_ledger",
    "type": "base",
    "system": false,
    "fields": [
      {
        "id": "text_esc_id",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true
      },
      {
        "id": "text_esc_b_id",
        "name": "bookingId",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_esc_i_id",
        "name": "invoiceId",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_esc_t_id",
        "name": "techId",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "text_esc_t_name",
        "name": "techName",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "text_esc_t_email",
        "name": "techEmail",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "text_esc_c_name",
        "name": "clientName",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "text_esc_c_email",
        "name": "clientEmail",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "text_esc_s_type",
        "name": "serviceType",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "text_esc_j_date",
        "name": "jobDate",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "num_esc_i_tot",
        "name": "invoiceTotal",
        "type": "number",
        "required": false,
        "system": false
      },
      {
        "id": "num_esc_b_com",
        "name": "baseCommission",
        "type": "number",
        "required": false,
        "system": false
      },
      {
        "id": "num_esc_tip",
        "name": "tipAmount",
        "type": "number",
        "required": false,
        "system": false
      },
      {
        "id": "num_esc_t_pay",
        "name": "totalPayout",
        "type": "number",
        "required": false,
        "system": false
      },
      {
        "id": "text_esc_status",
        "name": "status",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_esc_p_date",
        "name": "paidDate",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "num_esc_r_time",
        "name": "releaseTime",
        "type": "number",
        "required": false,
        "system": false
      },
      {
        "id": "bool_esc_disp",
        "name": "disputed",
        "type": "bool",
        "required": false,
        "system": false
      },
      {
        "id": "text_esc_t_disp_id",
        "name": "disputeTicketId",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "autodate_esc_c",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false
      },
      {
        "id": "autodate_esc_u",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "options": {}
  },
  {
    "id": "pbc_atltv_store_orders",
    "name": "atltv_store_orders",
    "type": "base",
    "system": false,
    "fields": [
      {
        "id": "text_so_id",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true
      },
      {
        "id": "json_so_items",
        "name": "items",
        "type": "json",
        "required": true,
        "system": false
      },
      {
        "id": "num_so_total",
        "name": "total",
        "type": "number",
        "required": true,
        "system": false
      },
      {
        "id": "text_so_status",
        "name": "status",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_so_address",
        "name": "address",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_so_email",
        "name": "email",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_so_name",
        "name": "name",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_so_pm",
        "name": "paymentMethod",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "text_so_ss",
        "name": "shippingSpeed",
        "type": "text",
        "required": false,
        "system": false
      },
      {
        "id": "autodate_so_c",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false
      },
      {
        "id": "autodate_so_u",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": "",
    "updateRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "options": {}
  },
  {
    "id": "pbc_atltv_uniform_orders",
    "name": "atltv_uniform_orders",
    "type": "base",
    "system": false,
    "fields": [
      {
        "id": "text_uo_id",
        "name": "id",
        "type": "text",
        "primaryKey": true,
        "required": true,
        "system": true
      },
      {
        "id": "text_uo_t_id",
        "name": "techId",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_uo_t_name",
        "name": "techName",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_uo_t_email",
        "name": "techEmail",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_uo_size",
        "name": "size",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_uo_ss",
        "name": "shippingSpeed",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "num_uo_ded",
        "name": "totalDeduction",
        "type": "number",
        "required": true,
        "system": false
      },
      {
        "id": "text_uo_status",
        "name": "status",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "text_uo_time",
        "name": "timestamp",
        "type": "text",
        "required": true,
        "system": false
      },
      {
        "id": "autodate_uo_c",
        "name": "created",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false
      },
      {
        "id": "autodate_uo_u",
        "name": "updated",
        "type": "autodate",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "options": {}
  }
];

try {
  const schemaFile = 'pb_schema.json';
  const rawData = fs.readFileSync(schemaFile, 'utf8');
  const collections = JSON.parse(rawData);

  // Filter out duplicates if script is run multiple times
  const filteredCollections = collections.filter(c => !newCollections.some(nc => nc.name === c.name));
  
  // Push the new schemas
  filteredCollections.push(...newCollections);

  fs.writeFileSync(schemaFile, JSON.stringify(filteredCollections, null, 2));
  console.log("Successfully appended new collections to pb_schema.json!");
} catch (err) {
  console.error("Failed to append schemas:", err.message);
}
