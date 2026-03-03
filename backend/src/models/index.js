const User = require('./User');
const ServiceType = require('./ServiceType');
const Ticket = require('./Ticket');
const Analytics = require('./Analytics');


Ticket.belongsTo(ServiceType, {
  foreignKey: 'serviceTypeId',
  as: 'serviceType'
});
ServiceType.hasMany(Ticket, {
  foreignKey: 'serviceTypeId',
  as: 'tickets'
});

Ticket.belongsTo(User, {
  foreignKey: 'servedBy',
  as: 'server'
});
User.hasMany(Ticket, {
  foreignKey: 'servedBy',
  as: 'servedTickets'
});

module.exports = {
  User,
  ServiceType,
  Ticket,
  Analytics
};