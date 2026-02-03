import { connectDB } from "./mongodb";
import Project from "./models/Project";
import Skill from "./models/Skill";
import Blog from "./models/Blog";
import Product from "./models/Product";
import Request from "./models/Request";
import Notification from "./models/Notification";
import { DonationSubmission } from "./models/Donation";

export async function getWebsiteContext() {
  try {
    await connectDB();
    
    const [projects, skills, blogs, products, requests, notifications, donations] = await Promise.all([
      Project.find({}).limit(10).select('title description techStack link'),
      Skill.find({}).select('name category level'),
      Blog.find({}).limit(10).select('title summary slug category'),
      Product.find({}).limit(10).select('name description price category'),
      Request.find({ status: 'completed' }).limit(5).select('title description'),
      Notification.find({ active: true }).limit(3).select('title content'),
      DonationSubmission.find({ status: 'verified' }).sort({ createdAt: -1 }).limit(5).select('name nominal message')
    ]);

    const context = `
Website Context Data (Current & Real-time):
- Identity: Wanyzx is a visionary Full Stack Developer, AI Engineer, and Digital Magic Maker.
- Core Skills: ${skills.map(s => `${s.name} (${s.level})`).join(", ")}
- Featured Projects: ${projects.map(p => `${p.title}: ${p.description} (Link: ${p.link || 'N/A'})`).join(" | ")}
- Knowledge Base (Blogs): ${blogs.map(b => `${b.title} (Slug: ${b.slug})`).join(" | ")}
- Commerce (Shop): ${products.map(p => `${p.name} - ${p.price}`).join(" | ")}
- Recent Completed Requests: ${requests.map(r => r.title).join(", ")}
- Active Announcements: ${notifications.map(n => n.title).join(", ")}
- Recent Verified Supporters: ${donations.map(d => `${d.name} donated ${d.nominal}`).join(", ")}

Operating Environment:
Wanyzx AI is the primary intelligence interface of this platform. It has access to all public data and is designed to provide expert-level technical support, creative brainstorming, and portfolio insights. If asked about projects or blogs, use the provided links/slugs.
`;
    return context;
  } catch (error) {
    console.error("Context fetch error:", error);
    return "Website data is currently unavailable.";
  }
}

