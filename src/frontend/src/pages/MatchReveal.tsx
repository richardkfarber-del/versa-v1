import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatchResults } from '../api';

const MatchReveal: React.FC = () => {
  const [matches, setMatches] = useState<{category: string; description: string; icon?: string; color?: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const partnerA = localStorage.getItem('versa_user_id') || 'partnerA_123';
        // Mocking partnerB id for now since we don't have linking flow implemented yet
        const partnerB = 'partnerB_456'; 
        const result = await getMatchResults(partnerA, partnerB);
        setMatches(result?.matchedCategories || [
          { category: 'Deep Conversation', description: 'Explore the unsaid with guided prompts for intimacy.', icon: 'forum', color: 'secondary' },
          { category: '15-Minute Massage', description: 'A gentle tactile exchange to release physical tension.', icon: 'self_care', color: 'primary' },
          { category: 'Slow Breathwork', description: 'Synchronized breathing to align your nervous systems.', icon: 'air', color: 'tertiary' }
        ]);
      } catch (error) {
        console.error("Failed to fetch matches", error);
        // Fallback for demo
        setMatches([
          { category: 'Deep Conversation', description: 'Explore the unsaid with guided prompts for intimacy.', icon: 'forum', color: 'secondary' },
          { category: '15-Minute Massage', description: 'A gentle tactile exchange to release physical tension.', icon: 'self_care', color: 'primary' },
          { category: 'Slow Breathwork', description: 'Synchronized breathing to align your nervous systems.', icon: 'air', color: 'tertiary' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen selection:bg-primary selection:text-on-primary">
      <header className="flex justify-between items-center w-full px-6 py-6 fixed top-0 z-50 bg-transparent backdrop-blur-xl bg-opacity-80">
        <div className="flex items-center gap-3">
          <img
            alt="Versa App Logo"
            className="w-10 h-10"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrvmj9fE8wymT5lgT3LS-1I4tErKwpKlcZZuBgCtk4uUqeqJUROyAn248BClzDQ4WiWQNsUuKA0ARQj5N1rlYYBIBTJFlbVQOgKk7ssUajQdcgft3WfNInH_cstvFo8Z1t736NVFdm33kSYq3d8aCaFb2HpGR8Y4DSf5Xfjcxjom-cP04c0gupbVoRMpRPIwQGKcVlElt1TdH9ZrHLHnB0hWT7XO4qntCiX9borKuvuxlTIfWS03Qee_G58IWo0ZPhlTmh7FsypTg"
          />
          <span className="text-2xl font-bold tracking-tighter font-headline text-slate-100">Versa</span>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="relative pt-24 pb-32 px-6 max-w-2xl mx-auto min-h-screen overflow-hidden">
        <div className="asymmetric-shape-1"></div>
        <div className="asymmetric-shape-2"></div>

        <section className="mb-12">
          <div className="relative w-full aspect-square mb-10 overflow-hidden rounded-3xl">
            <img
              className="w-full h-full object-cover grayscale opacity-40 mix-blend-lighten scale-110"
              alt="soft focus close up"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCykPTCUvDhwS-a0NL3LPDe4OR-UUcCe8XdkrpIgkTtf9qNvsnVjurVPQlLNVzhKIDlFCJsfMfrMOrXwsxv682nD_4cAprSD3Pae6uFa_8mtOKCZ7Ud49LV9IXdwRVQ9EYZ6XSbXgJdw4Dre35PCj7_b7Eb4f3aUHPLsm-pZBn4jEd_jAuJcaTSmjX--oPd7ggjU8OIugOKWTTij8cVfs-8LVoXLpa1bXMd7fcRHSaAe_gB5v_r0GPNuII4FB__3ydcIcuCTqMA8DM"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary/10 text-tertiary mb-6 border border-tertiary/20">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Symmetry Found</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold font-headline leading-[1.1] tracking-tight text-white mb-4">
                Your <br />Overlapping <br /><span className="text-primary-container">Desires</span>
              </h1>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {matches.map((match, index) => (
              <div 
                key={index} 
                className={`${index === 0 ? 'md:col-span-2' : ''} glass-card p-6 rounded-3xl border border-outline-variant/10 flex ${index === 0 ? 'items-center justify-between' : 'flex-col justify-between aspect-square'} group hover:bg-surface-container-high transition-all duration-500`}
              >
                {index === 0 ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <span className={`text-${match.color || 'secondary'} font-bold text-[11px] tracking-widest uppercase`}>Deep Connection</span>
                      <h3 className="text-2xl font-headline font-bold text-on-surface">{match.category}</h3>
                      <p className="text-on-surface-variant text-sm max-w-[240px]">{match.description}</p>
                    </div>
                    <div className={`w-16 h-16 rounded-2xl bg-${match.color || 'secondary'}/20 flex items-center justify-center text-${match.color || 'secondary'}-fixed group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-3xl">{match.icon || 'star'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-12 h-12 rounded-xl bg-${match.color || 'primary'}/10 flex items-center justify-center text-${match.color || 'primary'}-dim mb-4`}>
                      <span className="material-symbols-outlined text-2xl">{match.icon || 'star'}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-headline font-bold text-on-surface mb-2">{match.category}</h3>
                      <p className="text-on-surface-variant text-xs leading-relaxed">{match.description}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </section>
        )}

        <div className="text-center mb-16">
          <p className="text-on-surface-variant text-sm italic font-body">"The beauty of a match is the space where two worlds become one."</p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-8 z-50 bg-gradient-to-t from-surface via-surface/80 to-transparent">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => navigate('/date')}
            className="w-full bg-gradient-to-r from-secondary to-secondary-dim text-on-secondary py-5 rounded-3xl font-bold font-headline text-lg tracking-tight flex items-center justify-center gap-3 glow-secondary hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Start Date Night
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <p className="text-center text-on-surface-variant text-[10px] uppercase tracking-[0.3em] font-bold mt-6 opacity-60">Ready when you both are</p>
        </div>
      </div>
    </div>
  );
};

export default MatchReveal;
