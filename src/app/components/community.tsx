import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  Search,
  Plus,
  TrendingUp,
  Pin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface ForumPost {
  id: string;
  channel: string;
  author: string;
  authorInitials: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
  isPinned?: boolean;
}

const mockPosts: ForumPost[] = [
  {
    id: '1',
    channel: 'ra',
    author: 'Sarah M.',
    authorInitials: 'SM',
    title: 'Tips for managing morning stiffness',
    content: 'I\'ve found that gentle stretching before getting out of bed really helps. Does anyone else have strategies that work?',
    likes: 24,
    replies: 12,
    timestamp: '2 hours ago',
    isPinned: true,
  },
  {
    id: '2',
    channel: 'ra',
    author: 'Michael K.',
    authorInitials: 'MK',
    title: 'New to RA - feeling overwhelmed',
    content: 'Just diagnosed last month. Any advice for someone just starting this journey?',
    likes: 18,
    replies: 34,
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    channel: 'lupus',
    author: 'Emma L.',
    authorInitials: 'EL',
    title: 'Sun sensitivity - what products do you use?',
    content: 'Looking for recommendations on sunscreen and protective clothing that actually works.',
    likes: 31,
    replies: 28,
    timestamp: '6 hours ago',
    isPinned: true,
  },
  {
    id: '4',
    channel: 'lupus',
    author: 'David R.',
    authorInitials: 'DR',
    title: 'Fatigue management strategies',
    content: 'The fatigue has been hitting hard lately. What helps you get through the day?',
    likes: 42,
    replies: 19,
    timestamp: '1 day ago',
  },
  {
    id: '5',
    channel: 'pain-management',
    author: 'Jennifer P.',
    authorInitials: 'JP',
    title: 'Heat vs cold therapy - what works for you?',
    content: 'I\'ve been experimenting with both. Curious what others prefer for different types of pain.',
    likes: 27,
    replies: 15,
    timestamp: '8 hours ago',
  },
  {
    id: '6',
    channel: 'pain-management',
    author: 'Alex T.',
    authorInitials: 'AT',
    title: 'Non-medication pain relief techniques',
    content: 'Sharing my experience with acupuncture, meditation, and gentle yoga. What alternative methods have helped you?',
    likes: 55,
    replies: 41,
    timestamp: '12 hours ago',
    isPinned: true,
  },
  {
    id: '7',
    channel: 'working-out',
    author: 'Lisa B.',
    authorInitials: 'LB',
    title: 'Low-impact exercises for flare days',
    content: 'What do you do when you want to move but everything hurts? Looking for gentle options.',
    likes: 38,
    replies: 22,
    timestamp: '5 hours ago',
  },
  {
    id: '8',
    channel: 'working-out',
    author: 'Chris N.',
    authorInitials: 'CN',
    title: 'Swimming has changed my life',
    content: 'Just wanted to share how water-based exercises have helped my mobility and reduced pain. Anyone else love swimming?',
    likes: 61,
    replies: 29,
    timestamp: '1 day ago',
    isPinned: true,
  },
  {
    id: '9',
    channel: 'caregivers',
    author: 'Robert H.',
    authorInitials: 'RH',
    title: 'How to support during a flare without being overbearing?',
    content: 'My wife has RA and I want to help during flares, but I don\'t want to make her feel helpless. What\'s the balance?',
    likes: 47,
    replies: 31,
    timestamp: '3 hours ago',
    isPinned: true,
  },
  {
    id: '10',
    channel: 'caregivers',
    author: 'Patricia S.',
    authorInitials: 'PS',
    title: 'Caregiver burnout is real',
    content: 'Taking care of my mom with lupus while working full-time. How do you all manage self-care?',
    likes: 52,
    replies: 38,
    timestamp: '5 hours ago',
  },
  {
    id: '11',
    channel: 'caregivers',
    author: 'James W.',
    authorInitials: 'JW',
    title: 'Learning about medications - where to start?',
    content: 'My partner just started biologics and I want to understand what they\'re going through. Any resources you recommend?',
    likes: 33,
    replies: 24,
    timestamp: '7 hours ago',
  },
  {
    id: '12',
    channel: 'caregivers',
    author: 'Maria G.',
    authorInitials: 'MG',
    title: 'Attending doctor appointments - tips?',
    content: 'Going to rheumatologist appointment with my daughter next week. What questions should I ask? What\'s helpful vs. intrusive?',
    likes: 41,
    replies: 27,
    timestamp: '1 day ago',
    isPinned: true,
  },
];

const channels = [
  {
    id: 'all',
    name: 'All Channels',
    icon: Users,
    color: '#7293BB',
    description: 'View all community posts',
    members: '12.4k',
  },
  {
    id: 'ra',
    name: 'Rheumatoid Arthritis',
    icon: MessageCircle,
    color: '#B48CBF',
    description: 'Connect with others managing RA',
    members: '4.2k',
  },
  {
    id: 'lupus',
    name: 'Lupus',
    icon: MessageCircle,
    color: '#A5D3CF',
    description: 'Support and tips for lupus warriors',
    members: '3.8k',
  },
  {
    id: 'pain-management',
    name: 'Pain Management',
    icon: MessageCircle,
    color: '#CDADD0',
    description: 'Share strategies for managing chronic pain',
    members: '5.1k',
  },
  {
    id: 'working-out',
    name: 'Working Out with Symptoms',
    icon: MessageCircle,
    color: '#E89BA1',
    description: 'Exercise tips and motivation',
    members: '2.9k',
  },
  {
    id: 'caregivers',
    name: 'Caregivers',
    icon: MessageCircle,
    color: '#F8F6FF',
    description: 'Support for those caring for loved ones with chronic conditions',
    members: '3.5k',
  },
];

export function Community() {
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts =
    selectedChannel === 'all'
      ? mockPosts
      : mockPosts.filter((post) => post.channel === selectedChannel);

  const currentChannel = channels.find((c) => c.id === selectedChannel);

  const trendingTopics = [
    { topic: 'Morning Stiffness Tips', posts: 42 },
    { topic: 'Medication Side Effects', posts: 38 },
    { topic: 'Diet & Inflammation', posts: 35 },
    { topic: 'Exercise Routines', posts: 29 },
    { topic: 'Sleep Strategies', posts: 24 },
  ];

  const upcomingEvents = [
    {
      title: 'Weekly Support Group',
      date: 'Every Thursday 7PM EST',
      attendees: 45,
    },
    {
      title: 'Yoga for Joint Health',
      date: 'Mar 30, 2026 - 10AM EST',
      attendees: 28,
    },
    {
      title: 'Ask a Rheumatologist',
      date: 'Apr 5, 2026 - 3PM EST',
      attendees: 156,
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header */}
      <Card style={{ backgroundColor: '#7293BB' }}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="mb-2">Community</h1>
              <p className="text-white/90">
                Connect with others who understand your journey
              </p>
            </div>
            <Button
              variant="outline"
              className="bg-white text-[#7293BB] border-0 hover:bg-white/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Posts (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Channel Pills Navigation */}
          <div className="flex flex-wrap gap-2">
            {channels.map((channel) => {
              const isActive = selectedChannel === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#7293BB] text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {channel.name}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search discussions..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trending
                  </Button>
                  <Button variant="outline">Latest</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Channel Info */}
          {currentChannel && (
            <div className="flex items-center gap-3 px-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: currentChannel.color }}
              >
                <currentChannel.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3>{currentChannel.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentChannel.members} members
                </p>
              </div>
            </div>
          )}

          {/* Posts */}
          <div className="space-y-3">
            {filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No posts found. Be the first to start a discussion!
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className={`hover:shadow-md transition-shadow ${
                    post.isPinned ? 'border-l-4' : ''
                  }`}
                  style={
                    post.isPinned ? { borderLeftColor: '#7293BB' } : {}
                  }
                >
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback
                            style={{ backgroundColor: '#CDADD0' }}
                          >
                            {post.authorInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{post.author}</span>
                            <span className="text-sm text-muted-foreground">
                              {post.timestamp}
                            </span>
                            {post.isPinned && (
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: '#7293BB',
                                  color: '#7293BB',
                                }}
                              >
                                <Pin className="h-3 w-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                          </div>
                          <h4 className="mb-2">{post.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <button className="flex items-center gap-1 hover:text-[#7293BB] transition-colors">
                              <Heart className="h-4 w-4" />
                              <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-[#7293BB] transition-colors">
                              <MessageCircle className="h-4 w-4" />
                              <span>{post.replies} replies</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-[#7293BB] transition-colors">
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Sidebar Panels (1/3 width) */}
        <div className="space-y-4">
          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" style={{ color: '#7293BB' }} />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trendingTopics.map((topic, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-sm font-medium">{topic.topic}</span>
                  <Badge variant="secondary" className="text-xs">
                    {topic.posts}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" style={{ color: '#7293BB' }} />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{event.attendees} attending</span>
                  </div>
                  {idx < upcomingEvents.length - 1 && (
                    <div className="pt-2 border-b" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card style={{ backgroundColor: '#F8F6FF' }}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" style={{ color: '#7293BB' }} />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#A5D3CF' }} />
                  <span>Be kind and supportive</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#A5D3CF' }} />
                  <span>Respect privacy - no medical advice</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#A5D3CF' }} />
                  <span>Share experiences, not judgments</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#A5D3CF' }} />
                  <span>Report concerning content</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}