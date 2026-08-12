'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from '@/components/ui/tag';
import { Avatar } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export function PitchCard({ project, isMember }: any) {
  const { id, title, description, status, created_at, profiles } = project;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link href={`/projects/${id}`}>
        <Card className="h-full flex flex-col p-5 glass-card neon-glow-hover cursor-pointer relative overflow-hidden group transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors line-clamp-1">{title}</h3>
            <Badge variant={status === 'Recruiting' ? 'status-open' : 'default'} className="ml-2 whitespace-nowrap">
              {status}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {project.project_skills?.slice(0, 3).map((skill: any) => (
              <span key={skill.skill_id} className="px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-xs font-mono text-accent shadow-[0_0_8px_var(--color-accent-glow)]">
                {skill.skills?.name || skill.skill_id}
              </span>
            ))}
            {(project.project_skills?.length || 0) > 3 && (
              <span className="px-2 py-0.5 bg-surface border border-white/10 rounded-full text-xs text-white/50">
                +{project.project_skills!.length - 3}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {project.project_roles?.filter((r: any) => r.filled_count < r.required_count).map((role: any) => (
              <Badge key={role.id} variant="status-open" className="text-xs py-0.5">
                {role.required_count - role.filled_count}× {role.role}
              </Badge>
            ))}
          </div>
          
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {project.project_members?.slice(0, 3).map((member: any) => (
                  <Avatar 
                    key={member.user_id} 
                    src={member.profiles?.avatar_url}
                    name={member.profiles?.display_name || 'U'}
                    size="sm"
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500">
                <span className="text-gray-300">{profiles?.display_name}</span>
                <span className="mx-1">•</span>
                {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
              </div>
            </div>
            
            {!isMember && (
              <span className="text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Request to Join →
              </span>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
