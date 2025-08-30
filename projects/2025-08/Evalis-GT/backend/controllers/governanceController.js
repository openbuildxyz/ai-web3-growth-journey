const { Proposal, ProposalVote, Teacher, Notification } = require('../models');
const asyncHandler = require('express-async-handler');

// Create a new governance proposal (admin only)
exports.createProposal = asyncHandler(async (req, res) => {
  const { title, description, type, options, startAt, endAt } = req.body;

  if (!title || !description || !type) {
    return res.status(400).json({ message: 'title, description and type are required' });
  }
  const choiceOptions = Array.isArray(options) && options.length >= 2 ? options : ['Yes', 'No'];

  const proposal = await Proposal.create({
    title,
    description,
    type,
    options: choiceOptions,
    status: 'active',
    startAt: startAt ? new Date(startAt) : null,
    endAt: endAt ? new Date(endAt) : null,
    createdByAdminId: req.user?.id || req.admin?.id
  });

  // Create notifications for all teachers
  const teachers = await Teacher.findAll({ attributes: ['id', 'name', 'email'] });
  const notifPayloads = teachers.map(t => ({
    recipientRole: 'teacher',
    recipientId: t.id,
    title: `New Proposal: ${title}`,
    message: description.substring(0, 200) + (description.length > 200 ? '…' : ''),
    link: `/teacher?tab=governance&proposal=${proposal.id}`,
  }));
  if (notifPayloads.length) {
    await Notification.bulkCreate(notifPayloads);
  }

  res.status(201).json({ message: 'Proposal created', proposal });
});

// List proposals (teachers and admins)
exports.listProposals = asyncHandler(async (req, res) => {
  const status = req.query.status; // optional filter
  const where = status ? { status } : {};
  const proposals = await Proposal.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json(proposals);
});

// Get single proposal with aggregates and user vote
exports.getProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const proposal = await Proposal.findByPk(id);
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });

  // Load votes; if admin, include teacher details
  const includeTeacher = req.user?.role === 'admin';
  const votes = await ProposalVote.findAll({ 
    where: { proposalId: id },
    include: includeTeacher ? [{ model: require('../models').Teacher, attributes: ['id','name','email'] }] : undefined,
    order: [['createdAt','DESC']]
  });
  const counts = new Array(proposal.options.length).fill(0);
  votes.forEach(v => { if (counts[v.choiceIndex] !== undefined) counts[v.choiceIndex]++; });

  let myVote = null;
  if (req.user?.role === 'teacher') {
    const v = await ProposalVote.findOne({ where: { proposalId: id, teacherId: req.user.id } });
    if (v) myVote = v.choiceIndex;
  }

  let voters = undefined;
  if (includeTeacher) {
    voters = votes.map(v => ({
      teacherId: v.teacherId,
      teacherName: v.Teacher?.name || v.teacherId,
      teacherEmail: v.Teacher?.email || null,
      choiceIndex: v.choiceIndex,
      choiceLabel: Array.isArray(proposal.options) ? proposal.options[v.choiceIndex] : undefined,
      votedAt: v.createdAt
    }));
  }

  res.json({ proposal, totals: counts, totalVotes: votes.length, myVote, voters });
});

// Cast or update a vote (teachers)
exports.castVote = asyncHandler(async (req, res) => {
  const { id } = req.params; // proposal id
  const { choiceIndex } = req.body;
  if (typeof choiceIndex !== 'number') return res.status(400).json({ message: 'choiceIndex (number) required' });

  const proposal = await Proposal.findByPk(id);
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
  if (proposal.status !== 'active') return res.status(400).json({ message: 'Voting closed' });
  if (proposal.endAt && new Date(proposal.endAt) < new Date()) return res.status(400).json({ message: 'Voting period ended' });
  if (!proposal.options || choiceIndex < 0 || choiceIndex >= proposal.options.length) return res.status(400).json({ message: 'Invalid choiceIndex' });

  const teacherId = req.user.id;
  const [vote, created] = await ProposalVote.findOrCreate({
    where: { proposalId: id, teacherId },
    defaults: { proposalId: id, teacherId, choiceIndex }
  });
  if (!created) {
    vote.choiceIndex = choiceIndex;
    await vote.save();
  }

  res.json({ message: created ? 'Vote cast' : 'Vote updated', vote });
});

// Close proposal (admin)
exports.closeProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const proposal = await Proposal.findByPk(id);
  if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
  proposal.status = 'closed';
  await proposal.save();
  res.json({ message: 'Proposal closed', proposal });
});

// List notifications for current user
exports.listNotifications = asyncHandler(async (req, res) => {
  const role = req.user?.role;
  const userId = req.user?.id;
  const where = role === 'teacher' ? { recipientRole: 'teacher', recipientId: userId } : { recipientRole: 'teacher' };
  const notes = await Notification.findAll({ where, order: [['createdAt', 'DESC']], limit: 50 });
  res.json(notes);
});

// Mark notification read
exports.markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await Notification.findByPk(id);
  if (!note) return res.status(404).json({ message: 'Notification not found' });
  // Simple permission check: teachers can only mark their own
  if (req.user?.role === 'teacher' && note.recipientId !== req.user.id) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  note.read = true;
  await note.save();
  res.json({ message: 'Notification marked read' });
});
