const User       = require('./User');
const ServiceType = require('./ServiceType');
const Ticket     = require('./Ticket');
const Analytics  = require('./Analytics');
const Department = require('./Department');

// Ticket — ServiceType
Ticket.belongsTo(ServiceType, { foreignKey: 'serviceTypeId', as: 'serviceType' });
ServiceType.hasMany(Ticket,   { foreignKey: 'serviceTypeId', as: 'tickets' });

// Ticket — User
Ticket.belongsTo(User, { foreignKey: 'servedBy', as: 'server' });
User.hasMany(Ticket,   { foreignKey: 'servedBy', as: 'servedTickets' });

// Ticket — Department
Ticket.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(Ticket,   { foreignKey: 'departmentId', as: 'tickets' });

// User — Department
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(User,   { foreignKey: 'departmentId', as: 'staff' });

module.exports = { User, ServiceType, Ticket, Analytics, Department };