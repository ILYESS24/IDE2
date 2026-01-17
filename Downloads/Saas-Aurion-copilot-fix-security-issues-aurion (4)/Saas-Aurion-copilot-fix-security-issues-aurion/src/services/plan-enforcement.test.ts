 
import { describe, it, expect, beforeEach } from 'vitest';
import { PLANS, TOOL_COSTS, PlanType, ToolType } from '@/types/plans';

// ============================================
// TESTS D'ENFORCEMENT - LIMITES INCONTOURNABLES
// ============================================

// Simuler le service de plan
class MockPlanService {
  private userPlan: {
    planId: PlanType;
    creditsUsedThisPeriod: number;
    dailyUsage: Record<ToolType, number>;
    monthlyUsage: Record<ToolType, number>;
  };

  constructor(planId: PlanType = 'free') {
    this.userPlan = {
      planId,
      creditsUsedThisPeriod: 0,
      dailyUsage: this.emptyUsage(),
      monthlyUsage: this.emptyUsage(),
    };
  }

  private emptyUsage(): Record<ToolType, number> {
    return {
      image_generation: 0,
      video_generation: 0,
      code_generation: 0,
      ai_chat: 0,
      agent_builder: 0,
      app_builder: 0,
      website_builder: 0,
      text_editor: 0,
    };
  }

  getCreditsRemaining(): number {
    const plan = PLANS[this.userPlan.planId];
    return plan.credits - this.userPlan.creditsUsedThisPeriod;
  }

  checkAccess(tool: ToolType): { allowed: boolean; reason?: string } {
    const plan = PLANS[this.userPlan.planId];
    const feature = plan.features.find(f => f.tool === tool);
    const cost = TOOL_COSTS[tool];

    // 1. Outil non activé
    if (!feature || !feature.enabled) {
      return { allowed: false, reason: `${tool} non disponible dans le plan ${plan.name}` };
    }

    // 2. Crédits insuffisants
    if (this.getCreditsRemaining() < cost) {
      return { allowed: false, reason: `Crédits insuffisants (${this.getCreditsRemaining()}/${cost})` };
    }

    // 3. Limite quotidienne
    if (feature.dailyLimit !== null && this.userPlan.dailyUsage[tool] >= feature.dailyLimit) {
      return { allowed: false, reason: `Limite quotidienne atteinte (${feature.dailyLimit})` };
    }

    // 4. Limite mensuelle
    if (feature.monthlyLimit !== null && this.userPlan.monthlyUsage[tool] >= feature.monthlyLimit) {
      return { allowed: false, reason: `Limite mensuelle atteinte (${feature.monthlyLimit})` };
    }

    return { allowed: true };
  }

  consume(tool: ToolType): { success: boolean; error?: string } {
    const check = this.checkAccess(tool);
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const cost = TOOL_COSTS[tool];
    this.userPlan.creditsUsedThisPeriod += cost;
    this.userPlan.dailyUsage[tool]++;
    this.userPlan.monthlyUsage[tool]++;

    return { success: true };
  }

  upgradePlan(newPlan: PlanType) {
    this.userPlan.planId = newPlan;
  }

  // Pour les tests
  setCreditsUsed(amount: number) {
    this.userPlan.creditsUsedThisPeriod = amount;
  }

  setDailyUsage(tool: ToolType, count: number) {
    this.userPlan.dailyUsage[tool] = count;
  }

  setMonthlyUsage(tool: ToolType, count: number) {
    this.userPlan.monthlyUsage[tool] = count;
  }
}

// ============================================
// TESTS: BLOCAGE PAR PLAN
// ============================================

describe('Blocage par Plan - Enforcement', () => {
  let service: MockPlanService;

  beforeEach(() => {
    service = new MockPlanService('free');
  });

  it('Plan Free BLOQUE video_generation - IMPOSSIBLE à contourner', () => {
    const result = service.consume('video_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('non disponible');
  });

  it('Plan Free BLOQUE app_builder - IMPOSSIBLE à contourner', () => {
    const result = service.consume('app_builder');
    expect(result.success).toBe(false);
    expect(result.error).toContain('non disponible');
  });

  it('Plan Free BLOQUE agent_builder - IMPOSSIBLE à contourner', () => {
    const result = service.consume('agent_builder');
    expect(result.success).toBe(false);
    expect(result.error).toContain('non disponible');
  });

  it('Plan Free BLOQUE website_builder - IMPOSSIBLE à contourner', () => {
    const result = service.consume('website_builder');
    expect(result.success).toBe(false);
    expect(result.error).toContain('non disponible');
  });

  it('Plan Starter DÉBLOQUE video_generation', () => {
    service.upgradePlan('starter');
    const result = service.consume('video_generation');
    expect(result.success).toBe(true);
  });

  it('Plan Plus DÉBLOQUE app_builder', () => {
    service.upgradePlan('plus');
    const result = service.consume('app_builder');
    expect(result.success).toBe(true);
  });
});

// ============================================
// TESTS: LIMITES QUOTIDIENNES - ENFORCEMENT
// ============================================

describe('Limites Quotidiennes - Enforcement Strict', () => {
  let service: MockPlanService;

  beforeEach(() => {
    service = new MockPlanService('free');
  });

  it('Plan Free: 5 images/jour MAX - la 6ème est BLOQUÉE', () => {
    // Consommer 5 images
    for (let i = 0; i < 5; i++) {
      const result = service.consume('image_generation');
      expect(result.success).toBe(true);
    }

    // La 6ème doit être bloquée
    const result = service.consume('image_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite quotidienne');
  });

  it('Plan Free: 20 chats/jour MAX - le 21ème est BLOQUÉ', () => {
    // Consommer 20 chats
    for (let i = 0; i < 20; i++) {
      const result = service.consume('ai_chat');
      expect(result.success).toBe(true);
    }

    // Le 21ème doit être bloqué
    const result = service.consume('ai_chat');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite quotidienne');
  });

  it('Plan Starter: 20 images/jour MAX', () => {
    service.upgradePlan('starter');
    
    // Simuler 20 utilisations
    service.setDailyUsage('image_generation', 20);

    // La 21ème doit être bloquée
    const result = service.consume('image_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite quotidienne');
  });

  it('Plan Starter: 3 vidéos/jour MAX', () => {
    service.upgradePlan('starter');
    
    // Consommer 3 vidéos
    for (let i = 0; i < 3; i++) {
      const result = service.consume('video_generation');
      expect(result.success).toBe(true);
    }

    // La 4ème doit être bloquée
    const result = service.consume('video_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite quotidienne');
  });
});

// ============================================
// TESTS: LIMITES MENSUELLES - ENFORCEMENT
// ============================================

describe('Limites Mensuelles - Enforcement Strict', () => {
  let service: MockPlanService;

  beforeEach(() => {
    service = new MockPlanService('free');
  });

  it('Plan Free: 20 images/mois MAX - la 21ème est BLOQUÉE', () => {
    // Simuler 20 utilisations mensuelles
    service.setMonthlyUsage('image_generation', 20);

    // La 21ème doit être bloquée
    const result = service.consume('image_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite mensuelle');
  });

  it('Plan Starter: 15 vidéos/mois MAX', () => {
    service.upgradePlan('starter');
    
    // Simuler 15 utilisations
    service.setMonthlyUsage('video_generation', 15);

    // La 16ème doit être bloquée
    const result = service.consume('video_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite mensuelle');
  });

  it('Plan Plus: 500 images/mois MAX', () => {
    service.upgradePlan('plus');
    
    // Simuler 500 utilisations
    service.setMonthlyUsage('image_generation', 500);

    // La 501ème doit être bloquée
    const result = service.consume('image_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Limite mensuelle');
  });
});

// ============================================
// TESTS: CRÉDITS - ENFORCEMENT
// ============================================

describe('Crédits - Enforcement Strict', () => {
  let service: MockPlanService;

  beforeEach(() => {
    service = new MockPlanService('free');
  });

  it('100 crédits Free - BLOQUÉ quand épuisés', () => {
    // Consommer 90 crédits (9 images à 10 crédits)
    service.setCreditsUsed(90);
    
    // Il reste 10 crédits, une image passe
    let result = service.consume('image_generation');
    expect(result.success).toBe(true);

    // Maintenant il reste 0, bloqué
    result = service.consume('image_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Crédits insuffisants');
  });

  it('Vidéo (50 crédits) BLOQUÉE si seulement 30 crédits restants', () => {
    service.upgradePlan('starter'); // Débloque vidéo
    service.setCreditsUsed(970); // 1000 - 970 = 30 restants

    const result = service.consume('video_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Crédits insuffisants');
  });

  it('Chat IA (1 crédit) passe même avec 1 crédit restant', () => {
    service.setCreditsUsed(99); // 100 - 99 = 1 restant

    const result = service.consume('ai_chat');
    expect(result.success).toBe(true);
  });

  it('Image (10 crédits) BLOQUÉE avec 9 crédits restants', () => {
    service.setCreditsUsed(91); // 100 - 91 = 9 restants

    const result = service.consume('image_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Crédits insuffisants');
  });
});

// ============================================
// TESTS: COMBINAISON DE LIMITES
// ============================================

describe('Combinaison de Limites - Première Atteinte Gagne', () => {
  let service: MockPlanService;

  beforeEach(() => {
    service = new MockPlanService('free');
  });

  it('Limite quotidienne atteinte AVANT limite mensuelle', () => {
    // 5 images/jour max en Free
    service.setDailyUsage('image_generation', 5);
    service.setMonthlyUsage('image_generation', 10); // Encore 10 dans le mois

    const result = service.consume('image_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('quotidienne');
  });

  it('Limite mensuelle atteinte AVANT limite quotidienne', () => {
    // 0 aujourd'hui mais 20 dans le mois (max Free)
    service.setDailyUsage('image_generation', 0);
    service.setMonthlyUsage('image_generation', 20);

    const result = service.consume('image_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('mensuelle');
  });

  it('Crédits épuisés AVANT toutes les limites', () => {
    service.setCreditsUsed(100); // 0 crédits restants
    service.setDailyUsage('image_generation', 0);
    service.setMonthlyUsage('image_generation', 0);

    const result = service.consume('image_generation');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Crédits');
  });
});

// ============================================
// TESTS: UPGRADE DÉBLOQUE LES FONCTIONNALITÉS
// ============================================

describe('Upgrade Débloque Correctement', () => {
  let service: MockPlanService;

  beforeEach(() => {
    service = new MockPlanService('free');
  });

  it('Free -> Starter débloque vidéo', () => {
    // Bloqué en Free
    let result = service.consume('video_generation');
    expect(result.success).toBe(false);

    // Upgrade
    service.upgradePlan('starter');

    // Maintenant ça marche
    result = service.consume('video_generation');
    expect(result.success).toBe(true);
  });

  it('Starter -> Plus débloque app_builder', () => {
    service.upgradePlan('starter');
    
    // Bloqué en Starter
    let result = service.consume('app_builder');
    expect(result.success).toBe(false);

    // Upgrade
    service.upgradePlan('plus');

    // Maintenant ça marche
    result = service.consume('app_builder');
    expect(result.success).toBe(true);
  });

  it('Pro a des limites illimitées pour images', () => {
    service.upgradePlan('pro');
    
    // Simuler 1000 images aujourd'hui
    service.setDailyUsage('image_generation', 1000);

    // Devrait encore passer car Pro = illimité
    const result = service.consume('image_generation');
    expect(result.success).toBe(true);
  });
});

// ============================================
// TESTS: SÉCURITÉ - IMPOSSIBLE À CONTOURNER
// ============================================

describe('Sécurité - Impossible à Contourner', () => {
  let service: MockPlanService;

  beforeEach(() => {
    service = new MockPlanService('free');
  });

  it('checkAccess retourne TOUJOURS false si outil désactivé', () => {
    // Peu importe les crédits
    service.setCreditsUsed(0); // 100 crédits dispo

    const check = service.checkAccess('video_generation');
    expect(check.allowed).toBe(false);
  });

  it('consume retourne TOUJOURS error si checkAccess échoue', () => {
    const result = service.consume('video_generation');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('Les crédits ne peuvent pas être négatifs après consommation', () => {
    // Plan Pro pour éviter les limites quotidiennes
    service.upgradePlan('pro');
    
    // Pro a 25000 crédits, simuler qu'on en a utilisé 24990
    service.setCreditsUsed(24990); // 10 crédits restants (1 image)
    
    // Une image passe (10 crédits)
    const result = service.consume('image_generation');
    expect(result.success).toBe(true);
    expect(service.getCreditsRemaining()).toBe(0);

    // Plus de crédits, bloqué
    const finalResult = service.consume('image_generation');
    expect(finalResult.success).toBe(false);
    expect(finalResult.error).toContain('Crédits insuffisants');
    expect(service.getCreditsRemaining()).toBe(0);
  });
});

// ============================================
// TESTS: COHÉRENCE PLANS <-> FEATURES
// ============================================

describe('Cohérence Plans et Features', () => {
  
  it('Chaque plan a les 8 outils définis', () => {
    const tools: ToolType[] = [
      'image_generation', 'video_generation', 'code_generation',
      'ai_chat', 'agent_builder', 'app_builder', 'website_builder', 'text_editor'
    ];

    const plans: PlanType[] = ['free', 'starter', 'plus', 'pro', 'enterprise'];

    for (const planId of plans) {
      const plan = PLANS[planId];
      for (const tool of tools) {
        const feature = plan.features.find(f => f.tool === tool);
        expect(feature).toBeDefined();
        expect(typeof feature?.enabled).toBe('boolean');
      }
    }
  });

  it('Plans supérieurs ont plus de features activées', () => {
    const countEnabled = (planId: PlanType) => 
      PLANS[planId].features.filter(f => f.enabled).length;

    expect(countEnabled('starter')).toBeGreaterThanOrEqual(countEnabled('free'));
    expect(countEnabled('plus')).toBeGreaterThanOrEqual(countEnabled('starter'));
    expect(countEnabled('pro')).toBeGreaterThanOrEqual(countEnabled('plus'));
  });

  it('Plans supérieurs ont plus de crédits', () => {
    expect(PLANS.starter.credits).toBeGreaterThan(PLANS.free.credits);
    expect(PLANS.plus.credits).toBeGreaterThan(PLANS.starter.credits);
    expect(PLANS.pro.credits).toBeGreaterThan(PLANS.plus.credits);
    expect(PLANS.enterprise.credits).toBeGreaterThan(PLANS.pro.credits);
  });

  it('Prix croissants avec les plans', () => {
    expect(PLANS.starter.price).toBeGreaterThan(PLANS.free.price);
    expect(PLANS.plus.price).toBeGreaterThan(PLANS.starter.price);
    expect(PLANS.pro.price).toBeGreaterThan(PLANS.plus.price);
    expect(PLANS.enterprise.price).toBeGreaterThan(PLANS.pro.price);
  });
});

