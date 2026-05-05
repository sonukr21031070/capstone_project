package com.sih.edlearn.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

/**
 * Email Service for sending notifications to users
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@edlearn.com}")
    private String fromEmail;

    @Value("${spring.mail.from-name:EdLearn}")
    private String fromName;

    /**
     * Send simple text email
     */
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Simple email sent to {}", to);
        } catch (Exception e) {
            log.error("Error sending simple email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Send HTML email
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("HTML email sent to {}", to);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Error sending HTML email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Send email with attachment
     */
    public void sendEmailWithAttachment(String to, String subject, String htmlContent,
                                       String attachmentPath, String attachmentName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Add attachment if path provided
            if (attachmentPath != null && !attachmentPath.isEmpty()) {
                helper.addAttachment(attachmentName, new java.io.File(attachmentPath));
            }

            mailSender.send(message);
            log.info("Email with attachment sent to {}", to);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Error sending email with attachment to {}: {}", to, e.getMessage());
        }
    }

    // ===== NOTIFICATION EMAILS =====

    /**
     * Send welcome email to newly registered user
     */
    public void sendWelcomeEmail(String email, String name, String role) {
        String subject = "Welcome to EdLearn - Digital Learning Platform";
        String htmlContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #4F46E5;">Welcome to EdLearn!</h2>
                            <p>Hello <strong>%s</strong>,</p>
                            <p>Your account has been created successfully as a <strong>%s</strong>.</p>
                            <p>You can now log in to access our digital learning platform and start your educational journey.</p>
                            <div style="margin: 30px 0;">
                                <a href="http://localhost:5173/login" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Login Now
                                </a>
                            </div>
                            <p style="color: #666; font-size: 12px;">If you have any questions, please contact our support team.</p>
                            <hr>
                            <p style="color: #999; font-size: 12px;">© 2026 EdLearn. All rights reserved.</p>
                        </div>
                    </body>
                </html>
                """, name, role);
        sendHtmlEmail(email, subject, htmlContent);
    }

    /**
     * Send account approval notification
     */
    public void sendAccountApprovedEmail(String email, String name) {
        String subject = "Account Approved - EdLearn";
        String htmlContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #10B981;">Account Approved! ✓</h2>
                            <p>Hello <strong>%s</strong>,</p>
                            <p>Great news! Your account has been approved by the admin.</p>
                            <p>You can now access all features of EdLearn and start learning.</p>
                            <div style="margin: 30px 0;">
                                <a href="http://localhost:5173/login" style="background-color: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Start Learning
                                </a>
                            </div>
                            <p style="color: #666; font-size: 12px;">Welcome to our learning community!</p>
                        </div>
                    </body>
                </html>
                """, name);
        sendHtmlEmail(email, subject, htmlContent);
    }

    /**
     * Send account rejection notification
     */
    public void sendAccountRejectedEmail(String email, String name, String reason) {
        String subject = "Account Registration - Update Required";
        String htmlContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #EF4444;">Account Update Required</h2>
                            <p>Hello <strong>%s</strong>,</p>
                            <p>Your account registration could not be approved at this time.</p>
                            <p><strong>Reason:</strong> %s</p>
                            <p>Please contact the administrator or try registering again with the correct information.</p>
                            <div style="margin: 30px 0;">
                                <a href="http://localhost:5173/register" style="background-color: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Register Again
                                </a>
                            </div>
                        </div>
                    </body>
                </html>
                """, name, reason);
        sendHtmlEmail(email, subject, htmlContent);
    }

    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(String email, String name, String resetToken) {
        String subject = "Password Reset - EdLearn";
        String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;
        String htmlContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #4F46E5;">Password Reset Request</h2>
                            <p>Hello <strong>%s</strong>,</p>
                            <p>We received a request to reset your password. Click the link below to create a new password:</p>
                            <div style="margin: 30px 0;">
                                <a href="%s" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Reset Password
                                </a>
                            </div>
                            <p style="color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
                            <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                        </div>
                    </body>
                </html>
                """, name, resetLink);
        sendHtmlEmail(email, subject, htmlContent);
    }

    /**
     * Send announcement notification
     */
    public void sendAnnouncementEmail(String email, String recipientName, String announcementTitle, String announcementContent) {
        String subject = "📢 New Announcement - " + announcementTitle;
        String htmlContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #4F46E5;">📢 New Announcement</h2>
                            <p>Hello <strong>%s</strong>,</p>
                            <h3>%s</h3>
                            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                %s
                            </div>
                            <div style="margin: 30px 0;">
                                <a href="http://localhost:5173/announcements" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    View All Announcements
                                </a>
                            </div>
                        </div>
                    </body>
                </html>
                """, recipientName, announcementTitle, announcementContent);
        sendHtmlEmail(email, subject, htmlContent);
    }

    /**
     * Send quiz submission notification
     */
    public void sendQuizSubmissionEmail(String email, String studentName, String quizTitle,
                                       int score, int totalMarks, double percentage) {
        String subject = "📋 Quiz Completed - " + quizTitle;
        String htmlContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #4F46E5;">📋 Quiz Completed!</h2>
                            <p>Hello <strong>%s</strong>,</p>
                            <p>You have successfully completed the quiz: <strong>%s</strong></p>
                            <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                                <p style="font-size: 14px; color: #666; margin: 5px 0;">Your Score</p>
                                <p style="font-size: 32px; font-weight: bold; color: %s; margin: 10px 0;">%d / %d</p>
                                <p style="font-size: 18px; color: %s; margin: 5px 0;">%.1f%%</p>
                            </div>
                            <div style="margin: 30px 0;">
                                <a href="http://localhost:5173/student" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    View Results
                                </a>
                            </div>
                        </div>
                    </body>
                </html>
                """, studentName, quizTitle,
                percentage >= 70 ? "#10B981" : percentage >= 40 ? "#F59E0B" : "#EF4444",
                score, totalMarks,
                percentage >= 70 ? "#10B981" : percentage >= 40 ? "#F59E0B" : "#EF4444",
                percentage);
        sendHtmlEmail(email, subject, htmlContent);
    }

    /**
     * Send teacher feedback notification
     */
    public void sendTeacherFeedbackEmail(String email, String studentName, String teacherName,
                                         String subject, String feedback) {
        String emailSubject = "📝 Feedback from " + teacherName + " - " + subject;
        String htmlContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #4F46E5;">📝 Teacher Feedback</h2>
                            <p>Hello <strong>%s</strong>,</p>
                            <p><strong>%s</strong> has left feedback on your work in <strong>%s</strong>:</p>
                            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4F46E5;">
                                %s
                            </div>
                            <div style="margin: 30px 0;">
                                <a href="http://localhost:5173/student" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    View Your Progress
                                </a>
                            </div>
                        </div>
                    </body>
                </html>
                """, studentName, teacherName, subject, feedback);
        sendHtmlEmail(email, emailSubject, htmlContent);
    }

    /**
     * Send video published notification
     */
    public void sendVideoPublishedEmail(String email, String recipientName, String videoTitle, String subject) {
        String emailSubject = "🎬 New Video Available - " + videoTitle;
        String htmlContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #4F46E5;">🎬 New Video Released!</h2>
                            <p>Hello <strong>%s</strong>,</p>
                            <p>A new educational video has been published in <strong>%s</strong>:</p>
                            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <h3 style="color: #4F46E5;">%s</h3>
                            </div>
                            <div style="margin: 30px 0;">
                                <a href="http://localhost:5173/student/videos" style="background-color: #7C3AED; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    Watch Video
                                </a>
                            </div>
                        </div>
                    </body>
                </html>
                """, recipientName, subject, videoTitle);
        sendHtmlEmail(email, emailSubject, htmlContent);
    }

    /**
     * Send progress report email
     */
    public void sendProgressReportEmail(String email, String studentName, double avgScore,
                                       int chaptersCompleted, int studyMinutes) {
        String subject = "📊 Your Progress Report - EdLearn";
        String htmlContent = String.format("""
                <html>
                    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
                            <h2 style="color: #4F46E5;">📊 Your Progress Report</h2>
                            <p>Hello <strong>%s</strong>,</p>
                            <p>Here's your learning progress summary:</p>
                            <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                    <div style="text-align: center; padding: 10px; background: white; border-radius: 5px;">
                                        <p style="color: #666; font-size: 12px; margin: 0;">Average Score</p>
                                        <p style="font-size: 28px; font-weight: bold; color: #4F46E5; margin: 5px 0;">%.1f%%</p>
                                    </div>
                                    <div style="text-align: center; padding: 10px; background: white; border-radius: 5px;">
                                        <p style="color: #666; font-size: 12px; margin: 0;">Chapters</p>
                                        <p style="font-size: 28px; font-weight: bold; color: #10B981; margin: 5px 0;">%d</p>
                                    </div>
                                    <div style="text-align: center; padding: 10px; background: white; border-radius: 5px; grid-column: 1 / -1;">
                                        <p style="color: #666; font-size: 12px; margin: 0;">Study Time</p>
                                        <p style="font-size: 28px; font-weight: bold; color: #7C3AED; margin: 5px 0;">%d min</p>
                                    </div>
                                </div>
                            </div>
                            <div style="margin: 30px 0;">
                                <a href="http://localhost:5173/student/progress" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                    View Detailed Progress
                                </a>
                            </div>
                        </div>
                    </body>
                </html>
                """, studentName, avgScore, chaptersCompleted, studyMinutes);
        sendHtmlEmail(email, subject, htmlContent);
    }

    /**
     * Send account suspension notification
     */
    public void sendAccountSuspendedEmail(String email, String name, String reason) {
        String subject = "Account Suspended - EdLearn";
        String htmlContent = String.format("""
                <html>
                    <body style=\"font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;\">
                        <div style=\"max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;\">
                            <h2 style=\"color: #EF4444;\">Account Suspended</h2>
                            <p>Hello <strong>%s</strong>,</p>
                            <p>Your account has been suspended by the administrator.</p>
                            <p><strong>Reason:</strong> %s</p>
                            <p>If you believe this is a mistake or need further assistance, please contact support.</p>
                        </div>
                    </body>
                </html>
                """, name, reason);
        sendHtmlEmail(email, subject, htmlContent);
    }
}
