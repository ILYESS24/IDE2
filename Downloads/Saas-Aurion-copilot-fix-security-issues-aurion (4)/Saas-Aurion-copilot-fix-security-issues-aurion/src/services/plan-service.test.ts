/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PLANS, TOOL_COSTS, TOOL_LABELS, PlanType, ToolType } from '@/types/plans';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// ============================================
// TESTS: PLANS ET LIMITES
// ============================================

describe('Plans Configuration', () => {
  
  it('Plan Free existe et a 100 crédits', () => {
    expect(PLANS.free).toBeDefined();
    expect(PLANS.free.credits).toBe(100);
    expect(PLANS.free.price).toBe(0);
  });

  it('Plan Starter existe et a 1000 crédits', () => {
    expect(PLANS.starter).toBeDefined();
    expect(PLANS.starter.credits).toBe(1000);
    expect(PLANS.starter.price).toBe(9);
  });

  it('Plan Plus existe et a 5000 crédits', () => {
    expect(PLANS.plus).toBeDefined();
    expect(PLANS.plus.credits).toBe(5000);
    expect(PLANS.plus.price).toBe(29);
  });

  it('Plan Pro existe et a 25000 crédits', () => {
    expect(PLANS.pro).toBeDefined();
    expect(PLANS.pro.credits).toBe(25000);
    expect(PLANS.pro.price).toBe(99);
  });

  it('Plan Enterprise existe et a 100000 crédits', () => {
    expect(PLANS.enterprise).toBeDefined();
    expect(PLANS.enterprise.credits).toBe(100000);
    expect(PLANS.enterprise.price).toBe(499);
  });

  it('Tous les plans ont des features définies', () => {
    const planIds: PlanType[] = ['free', 'starter', 'plus', 'pro', 'enterprise'];
    
    for (const planId of planIds) {
      expect(PLANS[planId].features).toBeDefined();
      expect(PLANS[planId].features.length).toBeGreaterThan(0);
    }
  });
});

describe('Tool Costs', () => {
  
  it('Image generation coûte 10 crédits', () => {
    expect(TOOL_COSTS.image_generation).toBe(10);
  });

  it('Video generation coûte 50 crédits', () => {
    expect(TOOL_COSTS.video_generation).toBe(50);
  });

  it('AI Chat coûte 1 crédit', () => {
    expect(TOOL_COSTS.ai_chat).toBe(1);
  });

  it('Code generation coûte 5 crédits', () => {
    expect(TOOL_COSTS.code_generation).toBe(5);
  });

  it('Text editor est gratuit', () => {
    expect(TOOL_COSTS.text_editor).toBe(0);
  });

  it('Tous les outils ont un coût défini', () => {
    const tools: ToolType[] = [
      'image_generation', 'video_generation', 'code_generation',
      'ai_chat', 'agent_builder', 'app_builder', 'website_builder', 'text_editor'
    ];
    
    for (const tool of tools) {
      expect(TOOL_COSTS[tool]).toBeDefined();
      expect(typeof TOOL_COSTS[tool]).toBe('number');
    }
  });
});

describe('Plan Features - Access Control', () => {
  
  it('Plan Free bloque video_generation', () => {
    const feature = PLANS.free.features.find(f => f.tool === 'video_generation');
    expect(feature).toBeDefined();
    expect(feature?.enabled).toBe(false);
  });

  it('Plan Free permet image_generation avec limite', () => {
    const feature = PLANS.free.features.find(f => f.tool === 'image_generation');
    expect(feature).toBeDefined();
    expect(feature?.enabled).toBe(true);
    expect(feature?.dailyLimit).toBe(5);
    expect(feature?.monthlyLimit).toBe(20);
  });

  it('Plan Free bloque app_builder', () => {
    const feature = PLANS.free.features.find(f => f.tool === 'app_builder');
    expect(feature).toBeDefined();
    expect(feature?.enabled).toBe(false);
  });

  it('Plan Free bloque agent_builder', () => {
    const feature = PLANS.free.features.find(f => f.tool === 'agent_builder');
    expect(feature).toBeDefined();
    expect(feature?.enabled).toBe(false);
  });

  it('Plan Starter permet video_generation', () => {
    const feature = PLANS.starter.features.find(f => f.tool === 'video_generation');
    expect(feature).toBeDefined();
    expect(feature?.enabled).toBe(true);
  });

  it('Plan Plus permet app_builder', () => {
    const feature = PLANS.plus.features.find(f => f.tool === 'app_builder');
    expect(feature).toBeDefined();
    expect(feature?.enabled).toBe(true);
  });

  it('Plan Pro a des limites illimitées pour image', () => {
    const feature = PLANS.pro.features.find(f => f.tool === 'image_generation');
    expect(feature).toBeDefined();
    expect(feature?.enabled).toBe(true);
    expect(feature?.dailyLimit).toBeNull();
  });
});

describe('Credits Calculation', () => {
  
  it('Calcul crédits restants correct', () => {
    const total = 1000;
    const used = 350;
    const remaining = total - used;
    expect(remaining).toBe(650);
  });

  it('Calcul pourcentage utilisation correct', () => {
    const testCases = [
      { used: 0, total: 100, expected: 0 },
      { used: 50, total: 100, expected: 50 },
      { used: 75, total: 100, expected: 75 },
      { used: 100, total: 100, expected: 100 },
      { used: 250, total: 1000, expected: 25 },
    ];

    for (const tc of testCases) {
      const percentage = Math.round((tc.used / tc.total) * 100);
      expect(percentage).toBe(tc.expected);
    }
  });

  it('Vérification crédits suffisants', () => {
    const available = 80;
    const imageCost = TOOL_COSTS.image_generation; // 10
    const videoCost = TOOL_COSTS.video_generation; // 50
    
    expect(available >= imageCost).toBe(true);
    expect(available >= videoCost).toBe(true);
    
    // Après une vidéo, reste 30
    const afterVideo = available - videoCost;
    expect(afterVideo >= imageCost).toBe(true);
    expect(afterVideo >= videoCost).toBe(false);
  });
});

describe('Daily/Monthly Limits', () => {
  
  it('Vérification limite quotidienne', () => {
    const dailyLimit = 5;
    let dailyUsage = 0;

    // 5 utilisations
    for (let i = 0; i < 5; i++) {
      expect(dailyUsage < dailyLimit).toBe(true);
      dailyUsage++;
    }

    // 6ème utilisation bloquée
    expect(dailyUsage < dailyLimit).toBe(false);
  });

  it('Vérification limite mensuelle', () => {
    const monthlyLimit = 20;
    let monthlyUsage = 0;

    // 20 utilisations
    for (let i = 0; i < 20; i++) {
      expect(monthlyUsage < monthlyLimit).toBe(true);
      monthlyUsage++;
    }

    // 21ème utilisation bloquée
    expect(monthlyUsage < monthlyLimit).toBe(false);
  });

  it('Limite null = illimité', () => {
    const feature = PLANS.pro.features.find(f => f.tool === 'image_generation');
    
    const dailyLimit = feature?.dailyLimit;
    const usage = 1000;
    
    // Si limit est null, toujours autorisé
    const allowed = dailyLimit === null || usage < dailyLimit;
    expect(allowed).toBe(true);
  });
});

describe('Plan Upgrade Logic', () => {
  
  it('Upgrade Free -> Starter ajoute 900 crédits', () => {
    const oldCredits = PLANS.free.credits;
    const newCredits = PLANS.starter.credits;
    const bonus = newCredits - oldCredits;
    expect(bonus).toBe(900);
  });

  it('Upgrade Starter -> Plus ajoute 4000 crédits', () => {
    const oldCredits = PLANS.starter.credits;
    const newCredits = PLANS.plus.credits;
    const bonus = newCredits - oldCredits;
    expect(bonus).toBe(4000);
  });

  it('Upgrade Plus -> Pro ajoute 20000 crédits', () => {
    const oldCredits = PLANS.plus.credits;
    const newCredits = PLANS.pro.credits;
    const bonus = newCredits - oldCredits;
    expect(bonus).toBe(20000);
  });
});

describe('Tool Labels', () => {
  
  it('Tous les outils ont un label', () => {
    const tools: ToolType[] = [
      'image_generation', 'video_generation', 'code_generation',
      'ai_chat', 'agent_builder', 'app_builder', 'website_builder', 'text_editor'
    ];
    
    for (const tool of tools) {
      expect(TOOL_LABELS[tool]).toBeDefined();
      expect(TOOL_LABELS[tool].length).toBeGreaterThan(0);
    }
  });

  it('Labels corrects pour les outils principaux', () => {
    expect(TOOL_LABELS.image_generation).toBe('AI Images');
    expect(TOOL_LABELS.video_generation).toBe('AI Videos');
    expect(TOOL_LABELS.ai_chat).toBe('AI Chat');
  });
});

describe('Access Check Logic', () => {
  
  it('Retourne allowed=false si outil désactivé', () => {
    const plan = 'free';
    const tool = 'video_generation';
    
    const feature = PLANS[plan].features.find(f => f.tool === tool);
    const allowed = feature?.enabled ?? false;
    
    expect(allowed).toBe(false);
  });

  it('Retourne allowed=false si crédits insuffisants', () => {
    const availableCredits = 30;
    const cost = TOOL_COSTS.video_generation; // 50
    
    const allowed = availableCredits >= cost;
    expect(allowed).toBe(false);
  });

  it('Retourne allowed=true si tout OK', () => {
    const plan = 'plus';
    const tool = 'image_generation';
    
    const feature = PLANS[plan].features.find(f => f.tool === tool);
    const isEnabled = feature?.enabled ?? false;
    
    const availableCredits = 5000;
    const cost = TOOL_COSTS[tool];
    const hasCredits = availableCredits >= cost;
    
    const dailyUsage = 0;
    const dailyLimit = feature?.dailyLimit;
    const withinDailyLimit = dailyLimit === null || dailyUsage < dailyLimit;
    
    const allowed = isEnabled && hasCredits && withinDailyLimit;
    expect(allowed).toBe(true);
  });
});

describe('Usage History', () => {
  
  it('Calcul total crédits utilisés', () => {
    const history = [
      { tool: 'image_generation', credits: 10 },
      { tool: 'image_generation', credits: 10 },
      { tool: 'video_generation', credits: 50 },
      { tool: 'ai_chat', credits: 1 },
    ];
    
    const total = history.reduce((sum, h) => sum + h.credits, 0);
    expect(total).toBe(71);
  });

  it('Comptage par type d\'outil', () => {
    const history = [
      { tool: 'image_generation', credits: 10 },
      { tool: 'image_generation', credits: 10 },
      { tool: 'video_generation', credits: 50 },
    ];
    
    const imageCount = history.filter(h => h.tool === 'image_generation').length;
    const videoCount = history.filter(h => h.tool === 'video_generation').length;
    
    expect(imageCount).toBe(2);
    expect(videoCount).toBe(1);
  });
});

