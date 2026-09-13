export async function loadStudentNotifications(client) {
  const { data, error } = await client
    .from('notification_recipients')
    .select(`
      id,
      notification_id,
      student_id,
      student_academic_record_id,
      read_at,
      dismissed_at,
      created_at,
      notifications (
        id,
        title,
        body,
        notification_type,
        priority,
        action_url,
        metadata,
        status,
        published_at,
        expires_at,
        created_at
      )
    `)
    .is('dismissed_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const now = new Date();

  return (data ?? [])
    .map((row) => {
      const notification = row.notifications;

      if (!notification) return null;

      return {
        recipientId: row.id,
        notificationId: row.notification_id,
        studentId: row.student_id,
        academicRecordId: row.student_academic_record_id,

        title: notification.title,
        body: notification.body,
        type: notification.notification_type,
        priority: notification.priority,
        actionUrl: notification.action_url,
        metadata: notification.metadata ?? {},

        status: notification.status,
        publishedAt: notification.published_at,
        expiresAt: notification.expires_at,
        createdAt: notification.created_at,

        readAt: row.read_at,
        dismissedAt: row.dismissed_at,

        isRead: Boolean(row.read_at),
      };
    })
    .filter(Boolean)
    .filter((item) => item.status === 'published')
    .filter((item) => {
      if (!item.expiresAt) return true;

      return new Date(item.expiresAt) > now;
    })
    .sort((a, b) => {
      const aDate = new Date(a.publishedAt ?? a.createdAt).getTime();
      const bDate = new Date(b.publishedAt ?? b.createdAt).getTime();

      return bDate - aDate;
    });
}


export async function markNotificationRead(client, notificationId) {
  const id = Number(notificationId);

  if (!Number.isInteger(id)) {
    throw new Error('A valid notification ID is required.');
  }

  const { error } = await client.rpc('mark_notification_read', {
    p_notification_id: id,
  });

  if (error) throw error;
}


export async function dismissNotification(client, notificationId) {
  const id = Number(notificationId);

  if (!Number.isInteger(id)) {
    throw new Error('A valid notification ID is required.');
  }

  const { error } = await client.rpc('dismiss_notification', {
    p_notification_id: id,
  });

  if (error) throw error;
}


export function getUnreadNotificationCount(notifications = []) {
  return notifications.reduce(
    (count, notification) =>
      notification.isRead ? count : count + 1,
    0
  );
}

export async function loadAdminNotifications(client) {
  const { data, error } = await client
    .from('notifications')
    .select(`
      id,
      title,
      body,
      notification_type,
      priority,
      action_url,
      metadata,
      status,
      created_by,
      published_at,
      expires_at,
      created_at,
      updated_at,
      notification_recipients (
        id,
        student_id,
        student_academic_record_id,
        read_at,
        dismissed_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const recipients = row.notification_recipients ?? [];

    const readCount = recipients.filter(
      (recipient) => Boolean(recipient.read_at)
    ).length;

    const dismissedCount = recipients.filter(
      (recipient) => Boolean(recipient.dismissed_at)
    ).length;

    return {
      id: row.id,
      title: row.title,
      body: row.body,

      type: row.notification_type,
      priority: row.priority,

      actionUrl: row.action_url,
      metadata: row.metadata ?? {},

      status: row.status,

      createdBy: row.created_by,
      publishedAt: row.published_at,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,

      recipientCount: recipients.length,
      readCount,
      unreadCount: recipients.length - readCount,
      dismissedCount,

      recipients,
    };
  });
}


export async function listNotificationStudents(
  client,
  { year, classNumber } = {}
) {
  let query = client
    .from('student_academic_records')
    .select(`
      id,
      student_id,
      uid,
      academic_year,
      class,
      status,
      students (
        id,
        student_name
      )
    `)
    .order('uid', { ascending: true });

  if (year != null) {
    const academicYear = Number(year);

    if (!Number.isInteger(academicYear)) {
      throw new Error('A valid academic year is required.');
    }

    query = query.eq('academic_year', academicYear);
  }

  if (classNumber != null) {
    const classValue = Number(classNumber);

    if (!Number.isInteger(classValue)) {
      throw new Error('A valid class is required.');
    }

    query = query.eq('class', classValue);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []).map((row) => ({
    academicRecordId: row.id,
    studentId: row.student_id,
    studentName: row.students?.student_name ?? 'Unknown Student',
    uid: row.uid,
    academicYear: row.academic_year,
    class: row.class,
    academicStatus: row.status,
  }));
}


export async function createNotification(
  client,
  {
    title,
    body,
    type = 'general',
    priority = 'normal',
    actionUrl = null,
    metadata = {},
    status = 'published',
    publishedAt = null,
    expiresAt = null,
    recipients = [],
  }
) {
  const cleanTitle = String(title ?? '').trim();
  const cleanBody = String(body ?? '').trim();

  if (!cleanTitle) {
    throw new Error('Notification title is required.');
  }

  if (!cleanBody) {
    throw new Error('Notification body is required.');
  }

  const allowedTypes = [
    'general',
    'announcement',
    'assessment',
    'attendance',
    'material',
    'quiz',
    'fee',
    'system',
  ];

  const allowedPriorities = [
    'low',
    'normal',
    'high',
    'urgent',
  ];

  const allowedStatuses = [
    'draft',
    'published',
    'archived',
  ];

  if (!allowedTypes.includes(type)) {
    throw new Error('Invalid notification type.');
  }

  if (!allowedPriorities.includes(priority)) {
    throw new Error('Invalid notification priority.');
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error('Invalid notification status.');
  }

  const { data: authData, error: authError } =
    await client.auth.getUser();

  if (authError) throw authError;

  const createdBy = authData?.user?.id ?? null;

  const publicationTime =
    status === 'published'
      ? publishedAt ?? new Date().toISOString()
      : publishedAt;

  const { data: notification, error: notificationError } =
    await client
      .from('notifications')
      .insert({
        title: cleanTitle,
        body: cleanBody,
        notification_type: type,
        priority,
        action_url: actionUrl || null,
        metadata: metadata ?? {},
        status,
        created_by: createdBy,
        published_at: publicationTime,
        expires_at: expiresAt || null,
      })
      .select()
      .single();

  if (notificationError) throw notificationError;

  const normalizedRecipients = Array.from(
    new Map(
      recipients
        .filter((recipient) => recipient?.studentId)
        .map((recipient) => [
          Number(recipient.studentId),
          {
            studentId: Number(recipient.studentId),
            academicRecordId:
              recipient.academicRecordId != null
                ? Number(recipient.academicRecordId)
                : null,
          },
        ])
    ).values()
  );

  if (normalizedRecipients.length > 0) {
    const recipientRows = normalizedRecipients.map(
      (recipient) => ({
        notification_id: notification.id,
        student_id: recipient.studentId,
        student_academic_record_id:
          recipient.academicRecordId,
      })
    );

    const { error: recipientsError } = await client
      .from('notification_recipients')
      .insert(recipientRows);

    if (recipientsError) {
      throw recipientsError;
    }
  }

  return notification;
}


export async function archiveNotification(
  client,
  notificationId
) {
  const id = Number(notificationId);

  if (!Number.isInteger(id)) {
    throw new Error('A valid notification ID is required.');
  }

  const { data, error } = await client
    .from('notifications')
    .update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
}


export async function publishNotification(
  client,
  notificationId
) {
  const id = Number(notificationId);

  if (!Number.isInteger(id)) {
    throw new Error('A valid notification ID is required.');
  }

  const now = new Date().toISOString();

  const { data, error } = await client
    .from('notifications')
    .update({
      status: 'published',
      published_at: now,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
}