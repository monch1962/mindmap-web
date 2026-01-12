/**
 * Mind Map Templates
 * Pre-built templates for various use cases
 */

import type { MindMapTree } from '../types';
import { generateId } from './mindmapConverter';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'education' | 'personal' | 'project-management' | 'brainstorming';
  icon: string;
  tree: () => MindMapTree;
}

/**
 * Generate a unique ID for template nodes
 */
function templateId(): string {
  return `tpl_${generateId()}`;
}

/**
 * SWOT Analysis Template
 */
const swotAnalysis: Template = {
  id: 'swot-analysis',
  name: 'SWOT Analysis',
  description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
  category: 'business',
  icon: '🎯',
  tree: () => ({
    id: templateId(),
    content: 'SWOT Analysis',
    children: [
      {
        id: templateId(),
        content: '💪 Strengths',
        children: [
          { id: templateId(), content: 'Internal Strength 1', children: [] },
          { id: templateId(), content: 'Internal Strength 2', children: [] },
          { id: templateId(), content: 'Competitive Advantage', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '⚠️ Weaknesses',
        children: [
          { id: templateId(), content: 'Area for Improvement 1', children: [] },
          { id: templateId(), content: 'Resource Limitation', children: [] },
          { id: templateId(), content: 'Skill Gap', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '🚀 Opportunities',
        children: [
          { id: templateId(), content: 'Market Trend 1', children: [] },
          { id: templateId(), content: 'New Technology', children: [] },
          { id: templateId(), content: 'Partnership Potential', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '⚡ Threats',
        children: [
          { id: templateId(), content: 'Competitor Action', children: [] },
          { id: templateId(), content: 'Market Change', children: [] },
          { id: templateId(), content: 'Regulatory Risk', children: [] },
        ],
      },
    ],
  }),
};

/**
 * Project Planning Template
 */
const projectPlanning: Template = {
  id: 'project-planning',
  name: 'Project Planning',
  description: 'Plan your project with phases, milestones, and tasks',
  category: 'project-management',
  icon: '📋',
  tree: () => ({
    id: templateId(),
    content: 'Project Name',
    children: [
      {
        id: templateId(),
        content: '🎯 Objectives',
        children: [
          { id: templateId(), content: 'Define SMART goals', children: [] },
          { id: templateId(), content: 'Identify success metrics', children: [] },
          { id: templateId(), content: 'Align with strategy', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Timeline',
        children: [
          {
            id: templateId(),
            content: 'Phase 1: Planning',
            children: [
              { id: templateId(), content: 'Week 1-2: Requirements', children: [] },
              { id: templateId(), content: 'Week 3-4: Design', children: [] },
            ],
          },
          {
            id: templateId(),
            content: 'Phase 2: Execution',
            children: [
              { id: templateId(), content: 'Week 5-8: Development', children: [] },
              { id: templateId(), content: 'Week 9-10: Testing', children: [] },
            ],
          },
          {
            id: templateId(),
            content: 'Phase 3: Launch',
            children: [
              { id: templateId(), content: 'Week 11: Deployment', children: [] },
              { id: templateId(), content: 'Week 12: Review', children: [] },
            ],
          },
        ],
      },
      {
        id: templateId(),
        content: '👥 Team & Roles',
        children: [
          { id: templateId(), content: 'Project Manager', children: [] },
          { id: templateId(), content: 'Development Team', children: [] },
          { id: templateId(), content: 'Stakeholders', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '⚠️ Risks',
        children: [
          { id: templateId(), content: 'Identify potential risks', children: [] },
          { id: templateId(), content: 'Mitigation strategies', children: [] },
          { id: templateId(), content: 'Contingency plans', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📊 Resources',
        children: [
          { id: templateId(), content: 'Budget allocation', children: [] },
          { id: templateId(), content: 'Tools & equipment', children: [] },
          { id: templateId(), content: 'External dependencies', children: [] },
        ],
      },
    ],
  }),
};

/**
 * Brainstorming Template
 */
const brainstorming: Template = {
  id: 'brainstorming',
  name: 'Brainstorming Session',
  description: 'Capture and organize creative ideas',
  category: 'brainstorming',
  icon: '💡',
  tree: () => ({
    id: templateId(),
    content: 'Brainstorming Topic',
    children: [
      {
        id: templateId(),
        content: '🎯 Problem Statement',
        children: [
          { id: templateId(), content: 'What are we solving?', children: [] },
          { id: templateId(), content: 'Who is it for?', children: [] },
          { id: templateId(), content: 'Why does it matter?', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '💡 Ideas',
        children: [
          { id: templateId(), content: 'Idea 1', children: [] },
          { id: templateId(), content: 'Idea 2', children: [] },
          { id: templateId(), content: 'Idea 3', children: [] },
          { id: templateId(), content: 'Idea 4', children: [] },
          { id: templateId(), content: 'Idea 5', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '🔍 Analysis',
        children: [
          { id: templateId(), content: 'Pros & Cons', children: [] },
          { id: templateId(), content: 'Feasibility', children: [] },
          { id: templateId(), content: 'Resources needed', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '🏆 Top Picks',
        children: [
          { id: templateId(), content: 'Best Idea 1', children: [] },
          { id: templateId(), content: 'Best Idea 2', children: [] },
          { id: templateId(), content: 'Best Idea 3', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '✅ Next Steps',
        children: [
          { id: templateId(), content: 'Action items', children: [] },
          { id: templateId(), content: 'Timeline', children: [] },
          { id: templateId(), content: 'Assignments', children: [] },
        ],
      },
    ],
  }),
};

/**
 * Weekly Planner Template
 */
const weeklyPlanner: Template = {
  id: 'weekly-planner',
  name: 'Weekly Planner',
  description: 'Organize your week with goals and daily tasks',
  category: 'personal',
  icon: '📅',
  tree: () => ({
    id: templateId(),
    content: 'Week of [Date]',
    children: [
      {
        id: templateId(),
        content: '🎯 Weekly Goals',
        children: [
          { id: templateId(), content: 'Goal 1', children: [] },
          { id: templateId(), content: 'Goal 2', children: [] },
          { id: templateId(), content: 'Goal 3', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📋 Monday',
        children: [
          { id: templateId(), content: 'Priority Task 1', children: [] },
          { id: templateId(), content: 'Priority Task 2', children: [] },
          { id: templateId(), content: 'Meeting/Event', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📋 Tuesday',
        children: [
          { id: templateId(), content: 'Priority Task 1', children: [] },
          { id: templateId(), content: 'Priority Task 2', children: [] },
          { id: templateId(), content: 'Meeting/Event', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📋 Wednesday',
        children: [
          { id: templateId(), content: 'Priority Task 1', children: [] },
          { id: templateId(), content: 'Priority Task 2', children: [] },
          { id: templateId(), content: 'Meeting/Event', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📋 Thursday',
        children: [
          { id: templateId(), content: 'Priority Task 1', children: [] },
          { id: templateId(), content: 'Priority Task 2', children: [] },
          { id: templateId(), content: 'Meeting/Event', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📋 Friday',
        children: [
          { id: templateId(), content: 'Priority Task 1', children: [] },
          { id: templateId(), content: 'Priority Task 2', children: [] },
          { id: templateId(), content: 'Weekly Review', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '🌟 Weekend',
        children: [
          { id: templateId(), content: 'Personal Time', children: [] },
          { id: templateId(), content: 'Planning Next Week', children: [] },
        ],
      },
    ],
  }),
};

/**
 * Meeting Notes Template
 */
const meetingNotes: Template = {
  id: 'meeting-notes',
  name: 'Meeting Notes',
  description: 'Structured format for meeting documentation',
  category: 'business',
  icon: '📝',
  tree: () => ({
    id: templateId(),
    content: 'Meeting: [Title]',
    metadata: {
      notes: `Date: ${new Date().toLocaleDateString()}\nTime: \nLocation: \nAttendees: `,
    },
    children: [
      {
        id: templateId(),
        content: '🎯 Agenda',
        children: [
          { id: templateId(), content: 'Topic 1', children: [] },
          { id: templateId(), content: 'Topic 2', children: [] },
          { id: templateId(), content: 'Topic 3', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '💬 Discussion Points',
        children: [
          { id: templateId(), content: 'Key Discussion 1', children: [] },
          { id: templateId(), content: 'Key Discussion 2', children: [] },
          { id: templateId(), content: 'Key Discussion 3', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '✅ Decisions Made',
        children: [
          { id: templateId(), content: 'Decision 1', children: [] },
          { id: templateId(), content: 'Decision 2', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📋 Action Items',
        children: [
          { id: templateId(), content: 'Task 1 - Assigned to', children: [] },
          { id: templateId(), content: 'Task 2 - Assigned to', children: [] },
          { id: templateId(), content: 'Task 3 - Assigned to', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Next Meeting',
        children: [
          { id: templateId(), content: 'Date & Time', children: [] },
          { id: templateId(), content: 'Preparation needed', children: [] },
        ],
      },
    ],
  }),
};

/**
 * Decision Matrix Template
 */
const decisionMatrix: Template = {
  id: 'decision-matrix',
  name: 'Decision Matrix',
  description: 'Compare options against criteria to make decisions',
  category: 'business',
  icon: '📊',
  tree: () => ({
    id: templateId(),
    content: 'Decision: [What needs to be decided?]',
    children: [
      {
        id: templateId(),
        content: '🎯 Criteria',
        children: [
          { id: templateId(), content: 'Cost', children: [] },
          { id: templateId(), content: 'Time', children: [] },
          { id: templateId(), content: 'Quality', children: [] },
          { id: templateId(), content: 'Risk', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '🔵 Option 1',
        children: [
          { id: templateId(), content: 'Cost: ', children: [] },
          { id: templateId(), content: 'Time: ', children: [] },
          { id: templateId(), content: 'Quality: ', children: [] },
          { id: templateId(), content: 'Risk: ', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '🟢 Option 2',
        children: [
          { id: templateId(), content: 'Cost: ', children: [] },
          { id: templateId(), content: 'Time: ', children: [] },
          { id: templateId(), content: 'Quality: ', children: [] },
          { id: templateId(), content: 'Risk: ', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '🟡 Option 3',
        children: [
          { id: templateId(), content: 'Cost: ', children: [] },
          { id: templateId(), content: 'Time: ', children: [] },
          { id: templateId(), content: 'Quality: ', children: [] },
          { id: templateId(), content: 'Risk: ', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '🏆 Recommendation',
        children: [
          { id: templateId(), content: 'Best Option: ', children: [] },
          { id: templateId(), content: 'Reasoning: ', children: [] },
        ],
      },
    ],
  }),
};

/**
 * Learning Plan Template
 */
const learningPlan: Template = {
  id: 'learning-plan',
  name: 'Learning Plan',
  description: 'Structure your learning journey with goals and milestones',
  category: 'education',
  icon: '📚',
  tree: () => ({
    id: templateId(),
    content: 'Learning: [Subject/Skill]',
    children: [
      {
        id: templateId(),
        content: '🎯 Learning Objectives',
        children: [
          { id: templateId(), content: 'What do I want to achieve?', children: [] },
          { id: templateId(), content: 'Why is this important?', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📚 Resources',
        children: [
          { id: templateId(), content: 'Books/Courses', children: [] },
          { id: templateId(), content: 'Online Tutorials', children: [] },
          { id: templateId(), content: 'Practice Projects', children: [] },
          { id: templateId(), content: 'Mentor/Community', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Timeline',
        children: [
          {
            id: templateId(),
            content: 'Week 1-2: Foundations',
            children: [
              { id: templateId(), content: 'Topic 1', children: [] },
              { id: templateId(), content: 'Topic 2', children: [] },
            ],
          },
          {
            id: templateId(),
            content: 'Week 3-4: Intermediate',
            children: [
              { id: templateId(), content: 'Topic 3', children: [] },
              { id: templateId(), content: 'Practice Project', children: [] },
            ],
          },
          {
            id: templateId(),
            content: 'Week 5-6: Advanced',
            children: [
              { id: templateId(), content: 'Topic 4', children: [] },
              { id: templateId(), content: 'Final Project', children: [] },
            ],
          },
        ],
      },
      {
        id: templateId(),
        content: '✅ Milestones',
        children: [
          { id: templateId(), content: 'Complete basics quiz', children: [] },
          { id: templateId(), content: 'Build first project', children: [] },
          { id: templateId(), content: 'Teach someone else', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📊 Progress Tracking',
        children: [
          { id: templateId(), content: 'Hours logged', children: [] },
          { id: templateId(), content: 'Concepts mastered', children: [] },
          { id: templateId(), content: 'Projects completed', children: [] },
        ],
      },
    ],
  }),
};

/**
 * Product Roadmap Template
 */
const productRoadmap: Template = {
  id: 'product-roadmap',
  name: 'Product Roadmap',
  description: 'Plan product features and releases',
  category: 'project-management',
  icon: '🗺️',
  tree: () => ({
    id: templateId(),
    content: 'Product Roadmap',
    children: [
      {
        id: templateId(),
        content: '🎯 Vision',
        children: [
          { id: templateId(), content: 'Product vision', children: [] },
          { id: templateId(), content: 'Target audience', children: [] },
          { id: templateId(), content: 'Value proposition', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Q1',
        children: [
          { id: templateId(), content: 'Feature A', children: [] },
          { id: templateId(), content: 'Feature B', children: [] },
          { id: templateId(), content: 'Bug fixes', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Q2',
        children: [
          { id: templateId(), content: 'Feature C', children: [] },
          { id: templateId(), content: 'Feature D', children: [] },
          { id: templateId(), content: 'Performance improvements', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Q3',
        children: [
          { id: templateId(), content: 'Feature E', children: [] },
          { id: templateId(), content: 'Feature F', children: [] },
          { id: templateId(), content: 'UX improvements', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Q4',
        children: [
          { id: templateId(), content: 'Feature G', children: [] },
          { id: templateId(), content: 'Feature H', children: [] },
          { id: templateId(), content: 'Year-end review', children: [] },
        ],
      },
    ],
  }),
};

/**
 * Book Summary Template
 */
const bookSummary: Template = {
  id: 'book-summary',
  name: 'Book Summary',
  description: 'Capture key insights from books',
  category: 'education',
  icon: '📖',
  tree: () => ({
    id: templateId(),
    content: 'Book: [Title]',
    metadata: {
      notes: `Author: \nYear Published: \nGenre: `,
    },
    children: [
      {
        id: templateId(),
        content: '💡 Main Idea',
        children: [
          { id: templateId(), content: 'Core message', children: [] },
          { id: templateId(), content: 'Why it matters', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '🔑 Key Concepts',
        children: [
          { id: templateId(), content: 'Concept 1', children: [] },
          { id: templateId(), content: 'Concept 2', children: [] },
          { id: templateId(), content: 'Concept 3', children: [] },
          { id: templateId(), content: 'Concept 4', children: [] },
          { id: templateId(), content: 'Concept 5', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '💬 Memorable Quotes',
        children: [
          { id: templateId(), content: 'Quote 1', children: [] },
          { id: templateId(), content: 'Quote 2', children: [] },
          { id: templateId(), content: 'Quote 3', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📝 Chapter Summaries',
        children: [
          { id: templateId(), content: 'Chapter 1', children: [] },
          { id: templateId(), content: 'Chapter 2', children: [] },
          { id: templateId(), content: 'Chapter 3', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '✅ Action Items',
        children: [
          { id: templateId(), content: 'What will I do differently?', children: [] },
          { id: templateId(), content: 'To implement', children: [] },
          { id: templateId(), content: 'To share with', children: [] },
        ],
      },
    ],
  }),
};

/**
 * Goal Setting Template
 */
const goalSetting: Template = {
  id: 'goal-setting',
  name: 'Goal Setting (SMART)',
  description: 'Define SMART goals and action plans',
  category: 'personal',
  icon: '🎯',
  tree: () => ({
    id: templateId(),
    content: 'My Goal',
    children: [
      {
        id: templateId(),
        content: '🎯 SMART Definition',
        children: [
          { id: templateId(), content: 'Specific: What exactly?', children: [] },
          { id: templateId(), content: 'Measurable: How to track?', children: [] },
          { id: templateId(), content: 'Achievable: Is it realistic?', children: [] },
          { id: templateId(), content: 'Relevant: Why important?', children: [] },
          { id: templateId(), content: 'Time-bound: When to complete?', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '�Motivation',
        children: [
          { id: templateId(), content: 'Why do I want this?', children: [] },
          { id: templateId(), content: 'Benefits of achieving', children: [] },
          { id: templateId(), content: 'Consequences of not achieving', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📋 Action Steps',
        children: [
          { id: templateId(), content: 'Step 1', children: [] },
          { id: templateId(), content: 'Step 2', children: [] },
          { id: templateId(), content: 'Step 3', children: [] },
          { id: templateId(), content: 'Step 4', children: [] },
          { id: templateId(), content: 'Step 5', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '⚠️ Obstacles',
        children: [
          { id: templateId(), content: 'Potential obstacle 1', children: [] },
          { id: templateId(), content: 'Potential obstacle 2', children: [] },
          { id: templateId(), content: 'Solutions/Workarounds', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📊 Milestones',
        children: [
          { id: templateId(), content: '25% complete', children: [] },
          { id: templateId(), content: '50% complete', children: [] },
          { id: templateId(), content: '75% complete', children: [] },
          { id: templateId(), content: '100% complete', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '🏆 Support System',
        children: [
          { id: templateId(), content: 'Accountability partner', children: [] },
          { id: templateId(), content: 'Resources needed', children: [] },
          { id: templateId(), content: 'Help from others', children: [] },
        ],
      },
    ],
  }),
};

/**
 * Content Calendar Template
 */
const contentCalendar: Template = {
  id: 'content-calendar',
  name: 'Content Calendar',
  description: 'Plan your content publishing schedule',
  category: 'business',
  icon: '📆',
  tree: () => ({
    id: templateId(),
    content: 'Content Calendar: [Month]',
    children: [
      {
        id: templateId(),
        content: '🎯 Content Strategy',
        children: [
          { id: templateId(), content: 'Target audience', children: [] },
          { id: templateId(), content: 'Key themes', children: [] },
          { id: templateId(), content: 'Content pillars', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Week 1',
        children: [
          { id: templateId(), content: 'Mon: ', children: [] },
          { id: templateId(), content: 'Wed: ', children: [] },
          { id: templateId(), content: 'Fri: ', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Week 2',
        children: [
          { id: templateId(), content: 'Mon: ', children: [] },
          { id: templateId(), content: 'Wed: ', children: [] },
          { id: templateId(), content: 'Fri: ', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Week 3',
        children: [
          { id: templateId(), content: 'Mon: ', children: [] },
          { id: templateId(), content: 'Wed: ', children: [] },
          { id: templateId(), content: 'Fri: ', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '📅 Week 4',
        children: [
          { id: templateId(), content: 'Mon: ', children: [] },
          { id: templateId(), content: 'Wed: ', children: [] },
          { id: templateId(), content: 'Fri: ', children: [] },
        ],
      },
      {
        id: templateId(),
        content: '✅ Content Ideas',
        children: [
          { id: templateId(), content: 'Idea 1', children: [] },
          { id: templateId(), content: 'Idea 2', children: [] },
          { id: templateId(), content: 'Idea 3', children: [] },
        ],
      },
    ],
  }),
};

/**
 * All available templates
 */
export const templates: Template[] = [
  swotAnalysis,
  projectPlanning,
  brainstorming,
  weeklyPlanner,
  meetingNotes,
  decisionMatrix,
  learningPlan,
  productRoadmap,
  bookSummary,
  goalSetting,
  contentCalendar,
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: Template['category']): Template[] {
  return templates.filter(t => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

/**
 * Search templates
 */
export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return templates.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery)
  );
}
